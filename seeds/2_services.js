exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("services")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("services").insert([
        {
          service_identifier: "65a0058d-f9da-4e76-a00a-6013300cab5f",
          service_name: "event_calendar",
          display_name: "Event calendar",
          redirect_url: "https://calendar.tko-aly.fi",
          data_permissions: 2047
        },
        {
          service_identifier: "433f7cd9-e7db-42fb-aceb-c3716c6ef2b7",
          service_name: "kjyr",
          display_name: "KJYR",
          redirect_url: "https://kjyr.tko-aly.fi",
          data_permissions: 89
        }
      ]);
    });
};
