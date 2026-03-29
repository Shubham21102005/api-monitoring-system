`/Project title: API monitoring system. 

The tech stack will be MongoDB, React, ExpressJS, Node.js, and BullMQ/Redis for handling cron jobs. 

We also use Docker for Redis and MongoDB to get a better understanding of self-hosted or Dockerized applications. 

The core flow of the application is that any user can log in or register and set what API they want to monitor. It will take all four or five HTTP requests, the URL, the headers, and the body that has to be sent, and at what interval it will be sent. 

This I believe is facilitated using BullMQ, and I will also store the response of every request. along with its timestamp. 

There will also be retry logic. If a request sends 400 or 401 or 500, we will retry that twice and if it fails, we will send an alert or email to the user. 

For that, NodeMailer will be used or resend. 

For the first step, models will have to be created. 
