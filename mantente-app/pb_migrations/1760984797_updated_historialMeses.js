/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2514307686")

  // add field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_932442320",
    "hidden": false,
    "id": "relation1913689161",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "Historial_de_Ventas",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2514307686")

  // remove field
  collection.fields.removeById("relation1913689161")

  return app.save(collection)
})
