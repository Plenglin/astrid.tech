import sqlite3 from "better-sqlite3";
import { BlogPostWithDir } from "../cacher/blog";
import { Project, ProjectMeta, ProjectStatus } from "../types/types";
import { AssetDirObject } from "./util";

function getConnection() {
  return sqlite3("content.sqlite3", {});
}

export type Path = { year: string; month: string; day: string; slug: string[] };

export function getBlogPostSlugs(): Path[] {
  const db = getConnection();
  const results = db
    .prepare("SELECT date AS dateStr, slug FROM blog_post")
    .all() as {
    dateStr: string;
    slug: string;
  }[];
  return results.map(({ dateStr, slug }) => {
    const date = new Date(dateStr);
    return {
      year: date.getFullYear().toString(),
      month: (date.getMonth() + 1).toString().padStart(2, "0"),
      day: (date.getDate() + 1).toString().padStart(2, "0"),
      slug: [slug],
    };
  });
}

export function getBlogPost(path: Path): BlogPostWithDir<string> {
  const db = getConnection();
  const row = db
    .prepare(
      `SELECT id, asset_root as assetRoot, thumbnail, title, description, slug, date, content
      FROM blog_post
      WHERE year = @year AND month = @month AND day = @day AND slug = @slug`
    )
    .get({
      year: path.year,
      month: path.month,
      day: path.day,
      slug: path.slug[0],
    });
  const { id, assetRoot, title, slug, date, content, description } = row;

  const tags = db
    .prepare(`SELECT tag FROM blog_tag WHERE fk_blog = @id`)
    .all({ id });
  return {
    assetRoot,
    post: {
      title: title as string,
      slug: slug as string,
      date: date as string,
      content: content as string,
      description: description as string,
      thumbnail: null,
      tags: tags.map(({ tag }) => tag),
    },
  };
}
export function getProjectSlugs(): string[] {
  const db = getConnection();
  return db
    .prepare("SELECT slug FROM project")
    .all()
    .map(({ slug }) => slug);
}

export function getProject(slug: string): AssetDirObject<Project<string>> {
  const db = getConnection();
  const {
    id,
    assetRoot,
    title,
    status,
    description,
    startDate,
    endDate,
    url,
    source,
    thumbnail,
    content,
  } = db
    .prepare(
      `SELECT 
        id, 
        asset_root as assetRoot, 
        title, 
        status,
        description, 
        start_date as startDate, 
        end_date as endDate,
        url,
        source_urls as source,
        thumbnail_path as thumbnail,
        content
      FROM project
      WHERE @slug = slug`
    )
    .get({ slug });

  const tags = db
    .prepare(`SELECT tag FROM project_tag WHERE fk_project = @id`)
    .all({ id });

  return {
    assetRoot,
    object: {
      title: title as string,
      status: status as ProjectStatus,
      description: description as string,
      slug: slug as string,
      startDate: startDate as string,
      endDate: endDate as string | null,
      url: url as string,
      source: JSON.parse(source) as string[],
      content: content as string,
      thumbnail: thumbnail as string,
      tags: tags.map(({ tag }) => tag),
    },
  };
}

export function getProjectMetas(): AssetDirObject<ProjectMeta<string>>[] {
  const db = getConnection();
  const projects = db
    .prepare(
      `SELECT 
        id, 
        asset_root as assetRoot, 
        title, 
        status,
        description, 
        start_date as startDate, 
        end_date as endDate,
        url,
        source_urls as source,
        thumbnail_path as thumbnail
      FROM project`
    )
    .all();

  const tags = db.prepare(`SELECT fk_project, tag FROM project_tag`).all();

  const idToProject = new Map<number, AssetDirObject<ProjectMeta<string>>>(
    projects.map(
      ({
        id,
        assetRoot,
        title,
        status,
        description,
        startDate,
        slug,
        endDate,
        url,
        source,
        thumbnail,
      }) => [
        id as number,
        {
          assetRoot,
          object: {
            title: title as string,
            status: status as ProjectStatus,
            description: description as string,
            slug: slug as string,
            startDate: startDate as string,
            endDate: endDate as string | null,
            url: url as string,
            source: JSON.parse(source) as string[],
            thumbnail: thumbnail as string,
            tags: tags.map(({ tag }) => tag),
          },
        },
      ]
    )
  );

  for (const { fk_project, tag } of tags) {
    idToProject.get(fk_project)!!.object.tags.push(tag as string);
  }

  return [...idToProject.values()];
}