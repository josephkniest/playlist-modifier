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

const applyChange = function (change) {
  if ((typeof change) !== 'object') {
    return
  }
  if (change.changeType === '1') {
    putSongInPlayList(change.song_id, change.playlist_id)
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
