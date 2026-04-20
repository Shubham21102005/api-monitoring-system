`/Project title: API monitoring system. 

The tech stack will be MongoDB, React, ExpressJS, Node.js, and BullMQ/Redis for handling cron jobs. 

We also use Docker for Redis and MongoDB to get a better understanding of self-hosted or Dockerized applications. 

The core flow of the application is that any user can log in or register and set what API they want to monitor. It will take all four or five HTTP requests, the URL, the headers, and the body that has to be sent, and at what interval it will be sent. 

This I believe is facilitated using BullMQ, and I will also store the response of every request. along with its timestamp. 

There will also be retry logic. If a request sends 400 or 401 or 500, we will retry that twice and if it fails, we will send an alert or email to the user. 

For that, NodeMailer will be used or resend. 

For the first step, models will have to be created. 

created 3 models, a few more can be created when expanding upon the project

next step will be creating user controllers and routes, user will provide simple name email password for sign up and register, standard jwt middle ware will be used and bcrypt for hashing . just crud routes register, login and auth middleware can just be copied from an older project. 

finished user routes, gotta test next time i continue. : DONE
Login and register routes are working!! test email is johndoe@email.com and 12345678 is password

The controllers are now done. The next step should be to monitor controllers. For now, with only the current ones that are here, the monitor can:
- Get all monitors
- Get a single monitor
- Update a monitor
- Delete a monitor

Also, for the latest check, make sure that the updates or the deletes are actually being synced with BullMQ. 
The monitor of the protector takes a name, URL, method, headers, body, and query parameters, as well as a timeout and an expected response. Which one of these should be optional? 


