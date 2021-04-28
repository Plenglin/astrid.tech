module Astrid.Tech.Slug
  ( DatedSlug (..),
    ProjectSlug,
    constructBottomUp,
    getDay,
  )
where

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

instance Ord DatedSlug where
  compare a b = compare (year a, month a, day a, ordinal a) (year b, month b, day b, ordinal b)

getDay :: DatedSlug -> Day
getDay (DatedSlug y m d _ _) = fromGregorian y m d

constructBottomUp :: String -> Int -> Int -> Int -> Integer -> DatedSlug
constructBottomUp sn o d m y =
  DatedSlug
    { year = y,
      month = m,
      day = d,
      ordinal = o,
      shortName = sn
    }

instance Show DatedSlug where
  show (DatedSlug y m d o n) = printf "/%04d/%02d/%02d/%d/%s" y m d o n

type ProjectSlug = String
