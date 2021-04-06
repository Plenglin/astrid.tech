module Astrid.Tech.InputSchema.Tag
  ( TagOverrideSheet,
    ColorGroup,
  )
where

import Data.Aeson
import GHC.Generics

data TagOverride = TagOverride
  { slug :: String,
    name :: String
  }
  deriving (Generic)

instance FromJSON TagOverride

data ColorGroup = ColorGroup
  { backgroundColor :: String,
    color :: Maybe String,
    tags :: TagOverride
  }
  deriving (Generic)

instance FromJSON ColorGroup

type TagOverrideSheet = [ColorGroup]

-- readTagOverrideSheet :: FilePath -> IO TagOverrideSheet

-- readTagOverrideSheetDirectory :: FilePath -> IO TagOverrideSheet