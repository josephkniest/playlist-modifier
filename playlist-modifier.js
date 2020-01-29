const fs = require('fs')

const playlist = JSON.parse('' + fs.readFileSync(process.argv[2]))

const byId = function (id, property) {
  const props = playlist[property]
  for (var i = 0; i < props.length; i++) {
    if (props[i].id === id) {
      return props[i]
    }
  }
}

const putSongInPlayList = function (songId, playListId) {
  const song = byId(songId, 'songs')
  const list = byId(playListId, 'playlists')
  if ((typeof song) === 'object' && (typeof list) === 'object') {
    list.song_ids.push(songId)
  }
}

const putPlayListIntoSet = function (newPlayList) {
  if (newPlayList.song_ids.length === 0) {
    return
  }
  const ids = []
  for (var i = 0; i < playlist.playlists.length; i++) {
    ids.push(playlist.playlists[i].id)
  }
  ids.sort()
  var id = 1
  var missingSerial = false
  for (i = 0; i < ids.length; i++) {
    if (parseInt(ids[i]) > id) {
      missingSerial = true
      break
    }
    id++
  }
  newPlayList.id = '' + (missingSerial ? id : ids.length + 1)
  playlist.playlists.push(newPlayList)
}

const deletePlayListFromSet = function (playlistId) {
  if ((typeof playlistId) !== 'string') {
    return
  }
  const newPlaylistSet = []
  for (var i = 0; i < playlist.playlists.length; i++) {
    if (playlist.playlists[i].id !== playlistId) {
      newPlaylistSet.push(playlist.playlists[i])
    }
  }
  playlist.playlists = newPlaylistSet
}

const applyChange = function (change) {
  if ((typeof change) !== 'object') {
    return
  }
  if (change.changeType === '1') {
    putSongInPlayList(change.song_id, change.playlist_id)
  } else if (change.changeType === '2') {
    putPlayListIntoSet(change.newPlayList)
  } else if (change.changeType === '3') {
    deletePlayListFromSet(change.playlist_id)
  }
}

const applyChanges = function (changesBuff) {
  const changes = JSON.parse('' + changesBuff)
  for (var i = 0; (typeof changes) === 'object' && i < changes.length; i++) {
    applyChange(changes[i])
  }
}

const changeFile = process.argv[3]
const outFile = process.argv[4]
applyChanges(fs.readFileSync(changeFile))

fs.writeFileSync(outFile, JSON.stringify(playlist))
