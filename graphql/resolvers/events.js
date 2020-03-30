const Event = require("../../models/event");
const User = require("../../models/user");
const {transformEvent} = require("./merge");


module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map(event =>{
        return transformEvent(event)
      })
    }catch(err){
      throw err;
    }
  },
  createEvent: async (args, req) => {
    //args carries also request as req
    //use it to check auth
    if(!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    //create new event record
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId //mongoose will to ObjectID
    });
    let createdEvent;
    //save record to DB, with save() func
    //must have return statement because it
    //tells GraphQL that this resolver is Async Operation
    //otherwise it returns instantly
    try {
      const result =  await event.save();
      createdEvent = transformEvent(result);
      //this result(event) has an ID that 
      //should be saved to the relevant User
      //creator is the current user
      const creator = await User.findById(req.userId)
      if(!creator) {
        throw new Error("User does not exist.")
      }
      //mongoose will pull out id from event and store it
      creator.createdEvents.push(event)
      //this will update existing user
      await creator.save();
      //return the event as per Mutation return type
      return createdEvent;
    }catch(err) {
      throw err;
    }
  }
}