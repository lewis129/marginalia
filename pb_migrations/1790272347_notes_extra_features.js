migrate((app) => {
  const collection = app.findCollectionByNameOrId("notes")

  collection.fields.add({
    name: "tags",
    type: "select",
    options: {
      values: ["idea", "todo", "project", "reference", "question", "random"],
      maxSelect: 8,
      allowCustom: true,
    },
  })

  collection.fields.add({ name: "pinned", type: "bool" })
  collection.fields.add({ name: "archived", type: "bool" })
  collection.fields.add({ name: "due", type: "date" })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("notes")
  collection.fields.removeByName("tags")
  collection.fields.removeByName("pinned")
  collection.fields.removeByName("archived")
  collection.fields.removeByName("due")
  app.save(collection)
})