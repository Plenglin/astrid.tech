import Fuse from "fuse.js"
import { graphql, PageProps } from "gatsby"
import React, {
  ChangeEventHandler,
  createContext,
  FC,
  ReactNode,
  useContext,
  useState,
} from "react"
import { BsCaretDown, BsCaretUp, BsX } from "react-icons/bs"
import { FaInfoCircle } from "react-icons/fa"
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Collapse,
  Container,
  Input,
  InputGroup,
  Row,
  UncontrolledTooltip,
} from "reactstrap"
import { groupBy } from "src/util"
import Layout, { PageHeading } from "../components/layout"
import { ProjectCard } from "../components/project"
import SEO from "../components/seo"
import { TagBadge } from "../components/tag"
import { Project } from "../types"
import { Tag } from "../types/index"
import styles from "./projects.module.scss"

type Data = {
  site: {
    siteMetadata: {
      title: string
    }
  }
  allProject: {
    edges: {
      node: Project
    }[]
  }
  projectSearchIndex: {
    data: string
    keys: string[]
  }
}

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
    allProject(sort: { fields: [endDate], order: DESC }) {
      edges {
        node {
          featured
          ...ProjectCard
        }
      }
    }
    projectSearchIndex {
      data
      keys
    }
  }
`

type SearchContext = {
  slugToTag: Map<string, Tag>
  tagUsageCounts: Map<string, number>
  selectableTags: Tag[]
  projects: Project[]

  displayedProjects: Project[]

  isSearching: boolean
  searchString: string
  setSearchString: (searchString: string) => void

  filterTags: Tag[]
  addFilterTag: (slug: string) => void
  removeFilterTag: (slug: string) => void
  clearFilterTags: () => void

  shouldFilterAny: boolean
  setShouldFilterAny: (shouldFilterAny: boolean) => void
}

const SearchContext = createContext<SearchContext>({} as any)

type FiltererArgs = {
  children: ReactNode
  projects: Project[]
  fuse: Fuse<Project>
}

const Filterer: FC<FiltererArgs> = ({ children, projects, fuse }) => {
  const [searchString, _setSearchString] = useState("")
  const [filterTags, setFilterTags] = useState<string[]>([])
  const [shouldFilterAny, _setShouldFilterAnyTags] = useState<boolean>(false)

  const isSearching = searchString.length != 0

  const setSearchString = (searchString: string) => {
    _setSearchString(searchString)
  }

  const setShouldFilterAny = (shouldFilterAny: boolean) => {
    _setShouldFilterAnyTags(shouldFilterAny)
  }

  const addFilterTag = (slug: string) => {
    setFilterTags([...filterTags, slug])
  }

  const removeFilterTag = (slug: string) => {
    setFilterTags(filterTags.filter(tag => tag != slug))
  }

  const clearFilterTags = () => {
    setFilterTags([])
  }

  const filterTagsSet = new Set(filterTags)
  var displayedProjects =
    searchString == ""
      ? projects
      : (fuse.search(searchString).map((result: any) => {
          return result.item
        }) as Project[])

  if (filterTags.length > 0) {
    displayedProjects = displayedProjects.filter(project => {
      const filteredCount = project.tags.filter(tag =>
        filterTagsSet.has(tag.slug)
      ).length

      return shouldFilterAny
        ? filteredCount > 0
        : filteredCount == filterTags.length
    })
  }

  const tagUsageCounts = countTagUsages(displayedProjects)
  const orderedTags = displayedProjects
    .flatMap(project => project.tags)
    .sort((a, b) => tagUsageCounts.get(b.slug)! - tagUsageCounts.get(a.slug)!)
  const slugToTag = new Map(orderedTags.map(tag => [tag.slug, tag]))

  const selectableTags = [...slugToTag.values()].filter(
    tag => !filterTagsSet.has(tag.slug)
  )

  return (
    <SearchContext.Provider
      value={{
        isSearching,

        slugToTag,
        selectableTags,
        tagUsageCounts,
        projects,

        displayedProjects,

        searchString,
        setSearchString,

        filterTags: filterTags.map(slug => slugToTag.get(slug)!!),
        addFilterTag,
        removeFilterTag,
        clearFilterTags,

        shouldFilterAny,
        setShouldFilterAny,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

type CountBadgeProps = {
  tag: Tag
  count: number
}

const CountBadge: FC<CountBadgeProps> = ({ tag, count }) => (
  <Badge
    style={{
      color: tag.backgroundColor,
      backgroundColor: tag.color,
    }}
  >
    {count}
  </Badge>
)

const SelectableTagList: FC = () => {
  const { selectableTags, tagUsageCounts, addFilterTag } = useContext(
    SearchContext
  )

  return (
    <div className={styles.selectableTagsContainer}>
      {selectableTags.map(tag => (
        <span
          className={styles.selectableTag}
          onClick={() => addFilterTag(tag.slug)}
          key={tag.slug}
        >
          <TagBadge tag={tag}>
            {" "}
            <CountBadge tag={tag} count={tagUsageCounts.get(tag.slug)!} />
          </TagBadge>
        </span>
      ))}
    </div>
  )
}

const CurrentlyUsedTagList: FC = () => {
  const { filterTags, tagUsageCounts, removeFilterTag } = useContext(
    SearchContext
  )
  return (
    <div>
      {[...filterTags.values()].map(tag => (
        <span
          className={styles.deletableTag}
          onClick={() => removeFilterTag(tag.slug)}
          key={tag.slug}
        >
          <TagBadge tag={tag}>
            {" "}
            <CountBadge tag={tag} count={tagUsageCounts.get(tag.slug)!} />
            <BsX />
          </TagBadge>
        </span>
      ))}
    </div>
  )
}

const TagsFilterDropdown: FC = () => {
  const [tagListOpen, setTagListOpen] = useState(false)
  const toggleOpen = () => {
    setTagListOpen(!tagListOpen)
  }

  return (
    <Card>
      <CardBody>
        <Row>
          <h3
            style={{
              paddingLeft: 10,
            }}
          >
            Filter by tag
          </h3>
          <Col style={{ textAlign: "right" }}>
            <Button onClick={toggleOpen} outline size="sm">
              {tagListOpen ? <BsCaretUp /> : <BsCaretDown />}
            </Button>
          </Col>
        </Row>
        <Collapse isOpen={tagListOpen}>
          <SelectableTagList />
        </Collapse>
      </CardBody>
    </Card>
  )
}

const SearchBar: FC = () => {
  const { setSearchString } = useContext(SearchContext)
  const onChange: ChangeEventHandler<HTMLInputElement> = ev => {
    setSearchString(ev.target.value)
  }
  return (
    <InputGroup>
      <Input
        placeholder="astrid.tech, CPE 233, React, etc."
        onChange={onChange}
      />
    </InputGroup>
  )
}

const SearchSection: FC = () => {
  return (
    <section className={styles.searchSection}>
      <Container>
        <Row>
          <Col xs={12} md={6} style={{ paddingBottom: 20 }}>
            <h2>Search</h2>
            <SearchBar />
            <CurrentlyUsedTagList />
          </Col>
          <Col xs={12} md={6}>
            <TagsFilterDropdown />
          </Col>
        </Row>
      </Container>
    </section>
  )
}

export const CardGroup: FC<{
  idPrefix: string
  title?: { text: string; description?: string }
  projects: Project[]
}> = ({ title, idPrefix, projects }) => {
  var heading = null
  if (title) {
    const infoId = `${idPrefix}-section-info`
    heading = (
      <h3 className={styles.cardSectionTitle}>
        {title.text}{" "}
        {title.description ? (
          <>
            <FaInfoCircle
              title="Hover for information about this section"
              id={infoId}
            />
            <UncontrolledTooltip placement="right" target={infoId}>
              {title.description}
            </UncontrolledTooltip>
          </>
        ) : null}
      </h3>
    )
  }

  return (
    <section className={styles.cardGroupOuter}>
      {heading}
      <Row>
        {projects.map(project => (
          <Col
            xs="12"
            md="6"
            xl="4"
            key={project.slug}
            className={styles.projectCardWrapper}
          >
            <ProjectCard project={project} />
          </Col>
        ))}
      </Row>
    </section>
  )
}

export const ProjectCardsView: FC = () => {
  const { isSearching, displayedProjects } = useContext(SearchContext)
  if (isSearching) {
    return (
      <CardGroup
        idPrefix="results"
        title={{ text: "Results" }}
        projects={displayedProjects}
      />
    )
  } else {
    const map = groupBy(displayedProjects, project =>
      project.featured ? "featured" : project.status ?? "other"
    )
    return (
      <>
        <CardGroup
          idPrefix="featured"
          title={{ text: "Featured", description: "" }}
          projects={map.get("featured") ?? []}
        />
        <CardGroup
          idPrefix="wip"
          title={{ text: "WIP", description: "Things I'm actively working on" }}
          projects={map.get("wip") ?? []}
        />
        <CardGroup
          idPrefix="early"
          title={{
            text: "Early Phase",
            description:
              "Projects or ideas at the beginning of development. May be scrapped later.",
          }}
          projects={map.get("early") ?? []}
        />
        <CardGroup
          idPrefix="complete"
          title={{ text: "Complete", description: "Things I've finished!" }}
          projects={map.get("complete") ?? []}
        />
        <CardGroup
          idPrefix="scrapped"
          title={{
            text: "Scrapped",
            description: "Things I've deemed no longer viable.",
          }}
          projects={map.get("scrapped") ?? []}
        />
        <CardGroup
          idPrefix="other"
          title={{
            text: "Other",
            description: "Not scrapped, but not being worked on either.",
          }}
          projects={map.get("other") ?? []}
        />
      </>
    )
  }
}

function countTagUsages(projects: Project[]) {
  const count = new Map<string, number>()
  for (const project of projects) {
    for (const tag of project.tags) {
      count.set(tag.slug, 1 + (count.get(tag.slug) ?? 0))
    }
  }
  return count
}

const ProjectsIndex: FC<PageProps<Data>> = ({ data }) => {
  const projects = data.allProject.edges.map(({ node }) => node)

  const index = Fuse.parseIndex(JSON.parse(data.projectSearchIndex.data))
  const fuse = new Fuse<Project>(
    projects,
    {
      threshold: 0.4,
      keys: data.projectSearchIndex.keys,
    },
    index
  )

  const title = "Projects"
  const description =
    "An incomplete list of the projects I have worked on, of all sizes and types."

  return (
    <Layout currentLocation="projects">
      <SEO title={title} description={description} />
      <PageHeading title={title} description={description} bgColor="#3baddd" />
      <main>
        <Filterer projects={projects} fuse={fuse}>
          <SearchSection />
          <div className={styles.projectsView}>
            <Container style={{ paddingTop: 10 }}>
              <ProjectCardsView />
            </Container>
          </div>
        </Filterer>
      </main>
    </Layout>
  )
}

export default ProjectsIndex