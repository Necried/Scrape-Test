port module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Html.Parser exposing (..)
import Set exposing (Set)



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


type alias Model =
    ()


init : () -> ( Model, Cmd Msg )
init flags =
    ( ()
    , Cmd.none
    )



-- UPDATE


type Msg
    = Recv String



-- Use the `sendMessage` port when someone presses ENTER or clicks
-- the "Send" button. Check out index.html to see the corresponding
-- JS where this is piped into a WebSocket.
--


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Recv message ->
            ( ()
            , sendMessage <| scrapeTags message
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


scrapeTags : String -> String
scrapeTags s =
    let
        extractTags : Node -> String
        extractTags node =
            case node of
                Element tag attr moreNodes ->
                    case ( tag, attr ) of
                        ( "a", ( "href", hyperlink ) :: _ ) ->
                            (String.join " " <| List.map extractTags moreNodes)
                                ++ "("
                                ++ hyperlink
                                ++ ")"

                        ( _, _ ) ->
                            String.join " " <| List.map extractTags moreNodes

                Text txt ->
                    txt

                Comment _ ->
                    ""
    in
    case run (Debug.log "myhtml" s) of
        Err _ ->
            "Error: Failed to parse HTML string"

        Ok doc ->
            Debug.log "doc" doc
                -- Tuple.second <| doc.document
                |> List.map extractTags
                |> String.concat
                |> removeNewlines
                |> Debug.log "scraped"


removeNewlines : String -> String
removeNewlines =
    String.join " " << String.words
