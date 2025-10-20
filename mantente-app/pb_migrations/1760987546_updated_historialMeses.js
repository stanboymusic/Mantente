/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2514307686")

  // remove field
  collection.fields.removeById("date1858616837")

  // remove field
  collection.fields.removeById("relation1913689161")

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number3578090665",
    "max": null,
    "min": null,
    "name": "utilidad",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number8424862",
    "max": null,
    "min": null,
    "name": "ventas",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number2737288871",
    "max": null,
    "min": null,
    "name": "egresos",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "number3263525496",
    "max": null,
    "min": null,
    "name": "gastosFijos",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
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

  // remove field
  collection.fields.removeById("number3578090665")

  // remove field
  collection.fields.removeById("number8424862")

  // remove field
  collection.fields.removeById("number2737288871")

  // remove field
  collection.fields.removeById("number3263525496")

  return app.save(collection)
})
