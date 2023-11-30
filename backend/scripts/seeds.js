//TODO: seeds script should come here, so we'll be able to put some data in our local env

const mongoose = require("mongoose");
const connection = process.env.MONGODB_URI;
mongoose.connect(connection, { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model("User", { username: String, email: String });
const Item = mongoose.model("Item", { slug: String, title: String, description: String, seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }] });
const Comment = mongoose.model("Comment", { body: String, seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' } });

async function seedDatabase() {
  for (let i = 0; i < 100; i++) {
    // add user
    const user = { username: `user${i}`, email: `user${i}@gmail.com` };
    const createdUser = await User.create(user);

    // add item to user
    const item = {
      slug: `slug${i}`,
      title: `title ${i}`,
      description: `description ${i}`,
      seller: createdUser._id, // use the ObjectId of the created user
    };
    const createdItem = await Item.create(item);

    // add comments to item
    if (!createdItem?.comments?.length) {
      let commentIds = [];
      for (let j = 0; j < 100; j++) {
        const comment = new Comment({
          body: `body ${j}`,
          seller: createdUser._id, // use the ObjectId of the created user
          item: createdItem._id, // use the ObjectId of the created item
        });
        await comment.save();
        commentIds.push(comment._id);
      }
      createdItem.comments = commentIds;
      await createdItem.save();
    }
  }
}

seedDatabase()
  .then(() => {
    console.log("Finished DB seeding");
    process.exit(0);
  })
  .catch((err) => {
    console.log(`Error while running DB seed: ${err.message}`);
    process.exit(1);
  });
