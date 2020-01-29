/* global describe, it, afterEach, after */
const proc = require('child_process')
const fs = require('fs')
const assert = require('assert')
describe('exercise manipulating playlists', function () {
  const inputFile = './test/input.json'
  const input = '' + fs.readFileSync(inputFile)

  const dir = '/tmp/playlist-test/'

  fs.mkdirSync(dir)

  const changesFile = dir + 'changes.json'
  const outFile = dir + 'output.json'

  const verifyPlaylistEquality = function (actual, expected) {
    assert.strictEqual(typeof actual, 'object')
    assert.strictEqual(typeof expected, 'object')
    assert.strictEqual(typeof actual.users, 'object')
    assert.strictEqual(typeof expected.users, 'object')
    assert.strictEqual(actual.users.length, expected.users.length)
    assert.strictEqual(typeof actual.playlists, 'object')
    assert.strictEqual(typeof expected.playlists, 'object')
    assert.strictEqual(actual.playlists.length, expected.playlists.length)
    assert.strictEqual(typeof actual.songs, 'object')
    assert.strictEqual(typeof expected.songs, 'object')
    assert.strictEqual(actual.playlists.songs, expected.playlists.songs)
    for (var i = 0; i < actual.playlists.length; i++) {
      assert.strictEqual(actual.playlists[i].id, expected.playlists[i].id)
      assert.strictEqual(actual.playlists[i].user_id, expected.playlists[i].user_id)
      assert.strictEqual(typeof actual.playlists[i].song_ids, 'object')
      assert.strictEqual(typeof expected.playlists[i].song_ids, 'object')
      assert.strictEqual(actual.playlists[i].song_ids.length, expected.playlists[i].song_ids.length)
      for (var j = 0; j < actual.playlists[i].song_ids; j++) {
        assert.strictEqual(actual.playlists[i].song_ids[j], expected.playlists[i].song_ids[j])
      }
    }
  }

  const test = function (changes, expectedOutput, done) {
    fs.writeFile(changesFile, JSON.stringify(changes), function (writeError) {
      if (writeError) {
        assert.fail('Unexpected error when writing changes file: ' + writeError)
      }
      const cmd = 'node ./playlist-modifier.js ' + inputFile + ' ' + changesFile + ' ' + outFile
      proc.exec(cmd, function (execError, stdout, stderr) {
        if (execError && execError !== null) {
          assert.fail('Unexpected error when executing playlist modification: ' + execError)
        }
        if (stderr && stderr !== null) {
          assert.fail('Playlist modification finished with error: ' + stderr)
        }
        fs.readFile(outFile, function (readError, fileContent) {
          if (readError) {
            assert.fail('Unexpected error when reading back output file for verification: ' + readError)
          }
          verifyPlaylistEquality(JSON.parse('' + fileContent), expectedOutput)
          done()
        })
      })
    })
  }

  it('does nothing when change list is empty', function (done) {
    test([], JSON.parse(input), done)
  })

  it('does nothing when list contains a single unknown change type', function (done) {
    test([{ changeType: '0' }], JSON.parse(input), done)
  })

  it('puts song 1 but not non existent song 11 into playlist 2', function (done) {
    const changes = [
      {
        changeType: '1',
        song_id: '1',
        playlist_id: '3'
      },
      {
        changeType: '1',
        song_id: '11',
        playlist_id: '2'
      }
    ]
    const expectedOutput = JSON.parse(input)
    expectedOutput.playlists[2].song_ids.push('1')
    test(changes, expectedOutput, done)
  })

  it('puts song 3 into playlist 1, puts song 2 into playlist 2 and song 4 into playlist 3', function (done) {
    const changes = [
      {
        changeType: '1',
        song_id: '3',
        playlist_id: '1'
      },
      {
        changeType: '1',
        song_id: '2',
        playlist_id: '2'
      },
      {
        changeType: '1',
        song_id: '4',
        playlist_id: '3'
      }
    ]
    const expectedOutput = JSON.parse(input)
    expectedOutput.playlists[0].song_ids.push('3')
    expectedOutput.playlists[1].song_ids.push('2')
    expectedOutput.playlists[2].song_ids.push('4')
    test(changes, expectedOutput, done)
  })

  it('playlists 4 and 5 are added for user 4, but 6 is not added as it does not have a song', function (done) {
    const playlist4 = {
      user_id: '4',
      song_ids: [
        '1'
      ]
    }
    const playlist5 = {
      user_id: '4',
      song_ids: [
        '2',
        '3'
      ]
    }
    const playlist6 = {
      user_id: '4',
      song_ids: []
    }
    const changes = [
      {
        changeType: '2',
        newPlayList: playlist4
      },
      {
        changeType: '2',
        newPlayList: playlist5
      },
      {
        changeType: '2',
        newPlayList: playlist6
      }
    ]
    playlist4.id = '4'
    playlist5.id = '5'
    const expectedOutput = JSON.parse(input)
    expectedOutput.playlists.push(playlist4)
    expectedOutput.playlists.push(playlist5)
    test(changes, expectedOutput, done)
  })

  it('removes playlist 2, then inserts a new playlist number 2', function (done) {
    const playlist2 = {
      user_id: '1',
      song_ids: [
        '1'
      ]
    }

    const changes = [
      {
        changeType: '3',
        playlist_id: '2'
      },
      {
        changeType: '2',
        newPlayList: playlist2
      }
    ]
    playlist2.id = '2'
    const expectedOutput = JSON.parse(input)
    expectedOutput.playlists[1] = playlist2
    test(changes, expectedOutput, done)
  })

  it('removes playlist 1', function (done) {
    const changes = [
      {
        changeType: '3',
        playlist_id: '1'
      }
    ]
    const expectedOutput = JSON.parse(input)
    expectedOutput.playlists = [expectedOutput.playlists[1], expectedOutput.playlists[2]]
    test(changes, expectedOutput, done)
  })

  it('removes playlist 3', function (done) {
    const changes = [
      {
        changeType: '3',
        playlist_id: '3'
      }
    ]
    const expectedOutput = JSON.parse(input)
    expectedOutput.playlists = [expectedOutput.playlists[0], expectedOutput.playlists[1]]
    test(changes, expectedOutput, done)
  })

  afterEach(function () {
    fs.unlinkSync(changesFile)
    fs.unlinkSync(outFile)
  })

  after(function () {
    fs.rmdirSync(dir)
  })
})
