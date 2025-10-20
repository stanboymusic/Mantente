/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_932442320")

  // update collection data
  unmarshal({
    "createRule": "owner = @request.auth.id",
    "deleteRule": "owner = @request.auth.id",
    "listRule": "owner = @request.auth.id",
    "updateRule": "owner = @request.auth.id",
    "viewRule": "owner = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_932442320")

  // update collection data
  unmarshal({
    "createRule": "owner.id = @request.auth.id",
    "deleteRule": "owner.id = @request.auth.id",
    "listRule": "owner.id = @request.auth.id",
    "updateRule": "owner.id = @request.auth.id",
    "viewRule": "owner.id = @request.auth.id"
  }, collection)

  return app.save(collection)
})
