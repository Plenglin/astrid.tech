import json
from unittest import skip

from rest_framework.test import APITestCase

from comments.models import Comment, BannedIP, BannedEmail, BannedEmailDomain, Report
from comments.tests.utils import setup_comment_tree

create_comment_data = {
    'slug': '/test',
    'author_email': 'test@example.com',
    'author_name': 'Tester',
    'content_md': 'test **foo** <script>bar</script>',
}


def create_comment(**kwargs):
    return Comment.objects.create(slug='/foo', ip_addr='1.2.3.4', author_email='test@example.com', **kwargs)


def get_object_from_response(model, response):
    return model.objects.get(id=json.loads(response.content)['id'])


class BanListTests(APITestCase):
    def banned_comment_asserts(self, response):
        self.assertEqual(403, response.status_code)
        self.assertEqual(0, Comment.objects.count())
        self.assertEqual({'detail': 'testing purposes'}, json.loads(response.content))

    def test_banned_ip_cannot_post(self):
        BannedIP.objects.create(ip_addr='1.2.3.4', reason='testing purposes')

        response = self.client.post(
            '/api/comments/',
            create_comment_data,
            REMOTE_ADDR='1.2.3.4',
            format='json'
        )

        self.banned_comment_asserts(response)

    def test_banned_email_cannot_post(self):
        BannedEmail.objects.create(email='spammer@gmail.com', reason='testing purposes')

        response = self.client.post(
            '/api/comments/',
            {
                **create_comment_data,
                'author_email': 'spammer@gmail.com'
            },
            REMOTE_ADDR='1.2.3.4',
            format='json'
        )

        self.banned_comment_asserts(response)

    def test_banned_email_domain_cannot_post(self):
        BannedEmailDomain.objects.create(domain='evilsite.ru', reason='testing purposes')

        response = self.client.post(
            '/api/comments/',
            {
                **create_comment_data,
                'author_email': 'spammer@evilsite.ru'
            },
            REMOTE_ADDR='1.2.3.4',
            format='json'
        )

        self.banned_comment_asserts(response)

    def test_banned_ip_cannot_report_comment(self):
        comment = create_comment()
        BannedIP.objects.create(ip_addr='1.2.3.4')

        response = self.client.post(
            f'/api/comments/{comment.id}/report/',
            {
                'reason': 'spam test',
                'email': 'foo@example.com'
            },
            REMOTE_ADDR='1.2.3.4',
            format='json'
        )

        self.assertEqual(403, response.status_code)
        self.assertEqual(0, Report.objects.count())


class ModeratedCommentTests(APITestCase):
    def test_cannot_reply_to_locked_thread(self):
        pass


class CommentViewsTestCase(APITestCase):
    def setUp(self):
        self.a, self.b, self.c, self.d = setup_comment_tree()

    def tearDown(self):
        self.a.delete()
        self.b.delete()
        self.c.delete()
        self.d.delete()

    def test_can_filter_by_slug(self):
        create_comment()

        response1 = self.client.get('/api/comments/', {'slug': '/foo'})
        response2 = self.client.get('/api/comments/', {'slug': '/test'})

        data = json.loads(response1.content)
        self.assertEqual(1, len(data))
        data = json.loads(response2.content)
        self.assertEqual(4, len(data))

    def test_shows_all_comments(self):
        response = self.client.get('/api/comments/')

        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual(4, len(data))

    def test_unapproved_comments_are_hidden(self):
        self.a.mod_approved = False
        self.a.save()

        response = self.client.get('/api/comments/')

        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual(3, len(data))

    def test_can_create_comment(self):
        response = self.client.post(
            '/api/comments/',
            create_comment_data,
            REMOTE_ADDR='1.2.3.4',
            format='json'
        )

        self.assertEqual(200, response.status_code)
        comment = get_object_from_response(Comment, response)
        self.assertEqual('/test', comment.slug)
        self.assertEqual('Tester', comment.author_name)
        self.assertEqual('test@example.com', comment.author_email)
        self.assertEqual('1.2.3.4', comment.ip_addr)
        self.assertEqual(0, comment.children.count())
        self.assertNotIn('<script>', comment.content_html)

    def test_can_reply_to_comment(self):
        response = self.client.post(
            '/api/comments/',
            {**create_comment_data, 'reply_parent': self.c.id},
            format='json'
        )

        self.assertEqual(200, response.status_code)
        comment = get_object_from_response(Comment, response)
        self.assertIsNotNone(comment)
        self.assertEqual(self.c.id, comment.reply_parent.id)
        self.assertEqual(1, Comment.objects.get(id=self.c.id).children.count())

    def test_reply_normalizes_slug(self):
        response = self.client.post(
            '/api/comments/',
            {**create_comment_data, 'reply_parent': self.c.id, 'slug': '/badslug'},
            format='json'
        )

        self.assertEqual(200, response.status_code)
        data = json.loads(response.content)
        self.assertEqual(self.c.slug, data['slug'])
        self.assertEqual(5, Comment.objects.count())

    def test_can_report_comment(self):
        response = self.client.post(
            f'/api/comments/{self.c.id}/report/',
            {
                'reason': 'spam test',
                'email': 'foo@example.com'
            },
            format='json'
        )

        self.assertEqual(200, response.status_code)
        report = Report.objects.get()
        self.assertEqual(self.c.id, report.target.id)

    @skip("Quarantine NYI on frontend")
    def test_comment_containing_url_is_quarantined(self):
        response = self.client.post(
            '/api/comments/',
            {
                **create_comment_data,
                'content_md': 'http://google.com might be a spam site'
            },
            REMOTE_ADDR='1.2.3.4',
            format='json'
        )

        self.assertEqual(202, response.status_code)
        comment = Comment.objects.get(pk=5)
        self.assertFalse(comment.mod_approved)
