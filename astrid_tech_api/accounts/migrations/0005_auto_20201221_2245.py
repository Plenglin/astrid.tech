# Generated by Django 3.1.4 on 2020-12-21 22:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_googleauthattempt'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='uuid',
            new_name='id',
        ),
    ]
