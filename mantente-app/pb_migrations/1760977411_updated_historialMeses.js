/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2514307686")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "date1858616837",
    "max": "",
    "min": "",
    "name": "mes",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2514307686")

  // remove field
  collection.fields.removeById("date1858616837")

  return app.save(collection)
})
