# Playlist Modifier

This program will modify a playlist configuration immutably, that is pass it input json
containing songs, users and playlists, a change json containing the changes to be made
to the playlist set and the path to the output json that will contain the result of
the changes

## Usage

1) Install node: Debian ```apt-get install nodejs``` MacOS ```brew install node```
2) Install npm: Debian ```apt-get install npm``` MacOS ```brew install npm```
3) Pull down dependencies with ```npm install```
4) Acquire or compose a playlist input file. It should look like
```
{
  "users": [
    {
      "id": "1",
      "name": "user1"
    },
    {
      "id": "2",
      "name": "user2"
    },
    {
      "id": "3",
      "name": "user3"
    },
    {
      "id": "4",
      "name": "user4"
    }
  ],
  "playlists": [
    {
      "id": "1",
      "user_id": "3",
      "song_ids": [
        "2",
        "4"
      ]
    },
    {
      "id": "2",
      "user_id": "1",
      "song_ids": [
        "4",
        "1"
      ]
    },
    {
      "id": "3",
      "user_id": "2",
      "song_ids": [
        "2",
        "3"
      ]
    }
  ],
  "songs" : [
    {
      "id": "1",
      "artist": "artist1",
      "title": "song1"
    },
    {
      "id": "2",
      "artist": "artist2",
      "title": "song2"
    },
    {
      "id": "3",
      "artist": "artist3",
      "title": "song3"
    },
    {
      "id": "4",
      "artist": "artist4",
      "title": "song4"
    }
  ]
}
```
5) Acquire or compose a changes json file, it should look like
```
[
  {
    "changeType": "1",
    "song_id": "3",
    "playlist_id": "2"
  },
  {
    "changeType": "2",
    "newPlayList" : {
      "user_id": "4",
      "song_ids": [
        "1"
      ]
    }
  },
  {
    "changeType": "3",
    "playlist_id": "1"
  }
]
```
- Change type 1: Put an existing song in an existing playlist
- Change type 2: Give a new playlist to an existing user
- Change type 3: Delete an existing playlist

6) Execute the program with ```node playlist-modifier.js <path to input json> <path to changes json> <desired output json path>```

Data objects are referenced by id in the changes file. When a new playlist is to be added, the id is not required and will be ignored
if present as id assignment is the job of this program in maintaining an unsorted serial indexing scheme. Removals of playlists are
done by id.

## Maintenance

- Execute tests with ```npm test```

- Keep js files formatted correctly with ```npm run lint```
