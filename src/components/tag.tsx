import { Badge } from "reactstrap"
import { Tag, TagWrapper } from "../types/index"
import { Link, graphql } from "gatsby"
import React, { FC } from "react"
import style from "./tag.module.scss"

type TagBadgeProps = {
  tag: Tag
}

export const tagBadgeFragment = graphql`
  fragment TagBadge on Tag {
    name
    color
    textColor
    slug
  }
`

export const TagBadge: FC<TagBadgeProps> = ({ tag }) => {
  const linkTo = tag.slug[0] == "/" ? tag.slug : "/tag/" + tag.slug

  return (
    <>
      <Badge
        className={style.tag}
        style={{
          backgroundColor: tag.color,
          color: tag.textColor,
        }}
        tag={Link}
        to={linkTo}
      >
        {tag.name}
      </Badge>
    </>
  )
}

type TagListProps = {
  tags: Tag[]
}

export const TagList: FC<TagListProps> = ({ tags }) => {
  return (
    <div>
      <p
        style={{
          fontSize: "12pt",
        }}
      >
        {tags.map(tag => {
          return <TagBadge tag={tag} />
        })}
      </p>
    </div>
  )
}