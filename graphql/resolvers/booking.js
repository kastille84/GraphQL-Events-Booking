const Booking = require("../../models/booking");
const Event = require("../../models/event");
const {transformBooking, transformEvent} = require("./merge");



module.exports = {
  bookings: async (args, req) => {
    if(!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    try {
      const bookings = await Booking.find();
      return bookings.map(booking => {
        return transformBooking(booking);
      })
    } catch(err) {
      throw err;
    }
  },
  bookEvent: async (args, req) => {
    if(!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    const fetchedEvent = await Event.findOne({_id: args.eventId})
    const booking = new Booking({
      user: req.userId,
      event: fetchedEvent
    });
    const result = await booking.save();
    return transformBooking(result);
  },
    //will delete a booking entry
  cancelBooking: async (args, req) => {
    if(!req.isAuth) {
      throw new Error("Unauthenticated!")
    }
    try {
        //lets return the event that belongs to this booking
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = transformEvent(booking.event);
        //actual deletion of booking
      await Booking.deleteOne({_id:args.bookingId});
      return event;
    }catch(err) {
      throw err;
    }
  }
}