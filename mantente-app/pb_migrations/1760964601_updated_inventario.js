/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2494135909")

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "number2331474276",
    "max": null,
    "min": 0,
    "name": "Stock",
    "onlyInt": true,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2494135909")

  // remove field
  collection.fields.removeById("number2331474276")

  return app.save(collection)
})
