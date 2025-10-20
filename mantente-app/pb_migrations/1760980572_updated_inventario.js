/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2494135909")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3139177447",
    "max": null,
    "min": null,
    "name": "costo",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2494135909")

  // remove field
  collection.fields.removeById("number3139177447")

  return app.save(collection)
})
