module Astrid.Tech.Slug
  ( DatedSlug (..),
    ProjectSlug,
  )
where

import Data.List (intercalate)
import Data.Time
import Text.Printf (printf)

data DatedSlug = DatedSlug
  { year :: Integer,
    month :: Int,
    day :: Int,
    ordinal :: Int,
    shortName :: String
  }
  deriving (Eq)

getDay :: DatedSlug -> Day
getDay (DatedSlug y m d _ _) = fromGregorian y m d

instance Show DatedSlug where
  show (DatedSlug y m d o n) = printf "/%04d/%02d/%02d/%d/%s" y m d o n

type ProjectSlug = String