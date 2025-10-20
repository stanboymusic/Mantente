/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_932442320")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number400700311",
    "max": null,
    "min": null,
    "name": "cantidad",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_932442320")

  // remove field
  collection.fields.removeById("number400700311")

  return app.save(collection)
})
