port module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Parser exposing (..)
import Set exposing (Set)
import Set

-- MAIN


main : Program () Model Msg
main =
  Browser.element
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }




-- PORTS


port sendMessage : String -> Cmd msg
port messageReceiver : (String -> msg) -> Sub msg



-- MODEL


type alias Model = ()

init : () -> ( Model, Cmd Msg )
init flags =
  ( ()
  , Cmd.none
  )



-- UPDATE


type Msg
  = Recv String

myTagSet = Set.fromList ["p", "li"]

-- Use the `sendMessage` port when someone presses ENTER or clicks
-- the "Send" button. Check out index.html to see the corresponding
-- JS where this is piped into a WebSocket.
--
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Recv message ->
        ( ()
        , sendMessage <| scrapeTags myTagSet message
        )



-- SUBSCRIPTIONS


-- Subscribe to the `messageReceiver` port to hear about messages coming in
-- from JS. Check out the index.html file to see how this is hooked up to a
-- WebSocket.
--
subscriptions : Model -> Sub Msg
subscriptions _ =
  messageReceiver Recv


-- VIEW


view : Model -> Html Msg
view model =
  div [] []

scrapeTags : Set String -> String -> String
scrapeTags tagSet s =
    let
        extractTags : Node -> String
        extractTags node = case node of
            Element tag _ moreNodes ->
                if Set.member tag tagSet
                    then String.concat <| List.map extractTags moreNodes
                    else String.concat <| List.map extractTags <| List.filter elementFilter moreNodes
            Text txt -> txt
            Comment _ -> ""

        elementFilter : Node -> Bool
        elementFilter node = case node of
            Element _ _ _ -> True
            _ -> False

    in case run (Debug.log "myhtml" s) of
        Err _ -> "Error: Failed to parse HTML string"
        Ok doc ->
          Debug.log "doc" doc -- Tuple.second <| doc.document
            |> List.map extractTags
            |> String.concat
            |> removeNewlines
            |> Debug.log "scraped"

removeNewlines : String -> String
removeNewlines = String.join " " << String.words
