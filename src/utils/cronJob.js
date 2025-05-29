const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

cron.schedule(" * * * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 0);
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequestModel.find({
      status: "interested",
      createdAt: {
        $gte: yesterdayStart,
        $lte: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.email)),
    ];

    for (const email of listOfEmails) {
      const res = await sendEmail.run(
        "New Friend requests pending for " + email,
        +"There are so many friend requests pending, please login to DevTinder and accept/reject the requests"
      );
    }
  } catch (err) {
    console.error(err);
  }
});
