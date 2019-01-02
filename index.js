const _ = require('lodash')

module.exports = function GatheringMarkers(mod) {
  const herbs = [1, 2, 3, 4, 5, 6]
  const mines = [101, 102, 103, 104, 105, 106]
  const energies = [201, 202, 203, 204, 205, 206]
  const gatheringTargets = _.concat(herbs, mines, energies)

  const markers = []

  mod.command.add('gath', {
    $none() {
      mod.settings.enabled = !mod.settings.enabled
      mod.command.message(`你他媽在哪裡 ${mod.settings.enabled ? '<font color="#56B4E9">[開啟]' : '<font color="#E69F00">[關閉]'}`)
    },
    add(id) {
      id = Number(id)
      let message
      if (gatheringTargets.includes(id)) {
        if (!mod.settings.markTargets.includes(id))
          mod.settings.markTargets.push(id)
        message = `[${id}]<font color="#56B4E9"> 加入標記清單 </font>`
      } else {
        message = `$[{id}]<font color="#FF0000"> 非採集清單範圍內 </font>`
      }
      mod.command.message(message)
    },
    remove(id) {
      id = Number(id)
      _.pull(mod.settings.markTargets, id)
      mod.command.message(`$[{id}]<font color="#E69F00"> 從標記清單中移除 </font>`)
    },
    clean() {
      mod.settings.markTargets = []
      mod.command.message(`<font color="#E69F00">清除所有標記清單`)
    },
	list() {
		mod.command.message(`雜草[1] 玉米[2] 紅蘿蔔[3] 黃蘑菇[4] 老南瓜[5] 蘋果樹[6]`)
		mod.command.message(`岩石[101] 鈷礦石[102] 硒礦石[103] 水晶礦石[104] 秘銀礦石[105] 碣礦石[106]`)
		mod.command.message(`無色結晶[201] 赤色結晶[202] 綠色結晶[203] 青色結晶[204] 黑色結晶[205]`)
	},
    $default(args) {
      switch (args[0]) {
        case 'herb':
          mod.settings.markTargets = herbs
          break
        case 'mine':
          mod.settings.markTargets = mines
          break
        case 'energy':
          mod.settings.markTargets = energies
          break
        default:
          return mod.command.message(`${args[0]} <font color="#FF0000">無效參數`)
      }
    }
  })

  mod.game.me.on('change_zone', clearMarkers)

  mod.hook('S_SPAWN_COLLECTION', 4, event => {
    if (!mod.settings.enabled || !mod.settings.markTargets.includes(event.id))
      return

    const id = event.gameId * 2n
    spawnMarker(id, event.loc)
  })

  mod.hook('S_DESPAWN_COLLECTION', 2, event => {
    const id = event.gameId * 2n
    despawnMarker(id)
  })

  function spawnMarker(id, loc) {
    if (markers.includes(id))
      return

    loc.z -= 100
    mod.send('S_SPAWN_DROPITEM', 6, {
      gameId: id,
      loc,
      item: 98260,
      amount: 1,
      expiry: 300000,
      owners: [{ id: 0 }]
    })
    markers.push(id)
  }

  function despawnMarker(id) {
    if (!markers.includes(id))
      return

    mod.send('S_DESPAWN_DROPITEM', 4, { gameId: id })
    _.pull(markers, id)
  }

  function clearMarkers() {
    markers.forEach(despawnMarker)
  }
}	
