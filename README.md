# Trello Clone React/Redux Tutorial

## Overview

This project is intended for anyone interested in practicing Front-end
development with React, Redux, and Sagas.

This repository has a ready and working Trello clone API (built by
Ryan Nicoletti, @RyanNicoletti) that is missing a matching Front-end. 

A React/Redux/Sagas boilerplate made by @manishaggarwalm was used as a
foundation for the UI, and a simple Login UI was built by me that could be
used as an example and starting point for making a more complete UI.

Notes for setting up the server were gathered and tested on Linux.




## Setup

### Build the React UI

    cd ui
    npm install
    npm run build:dev

### Set up Postgres Server/Process

Install postgres (version 10 or higher) and log into the DB.

On Linux, this is:

    sudo apt-get -y install postgresql
    # You may need to run a command like, watch the install output: pg_ctlcluster 12 main start
    # You may also need to run: sudo systemctl start postgresql@12-main
    sudo -u postgres psql

On MacOS you can use postgress app: <https://postgresapp.com/> then to log in run

    psql -h localhost

After logging into postgres, create a database for this trello app:

    create database trello;
    create user trelloadmin with encrypted password 'securePassword';
    grant all privileges on database trello to trelloadmin;
    exit

Test it works by typing:

    psql -U trelloadmin --password trello

It did not work for me on Linux, I had to change a line in 
`/etc/postgresql/12/main/pg_hba.conf` to allow password authentication

    # FROM:
    local   all             all                                     peer
    # TO:
    local   all             all                                     md5

Then I restarted postgres using `sudo systemctl restart postgresql@12-main`

Finally, open `src/config.js` and confirm the username, password, and
database are all specified correctly in the config

    postgresql://trelloadmin:securePassword@localhost/trello


### Migrate the DB

Create a `.env` file in the **root** of this repo and specify the postgres information

    DATABASE_URL="postgresql://trelloadmin:securePassword@localhost/trello

In the root dir, run migrations:

    npm run migrate


### Start the server

Run the server, from the root dir so we can make API calls.

    npm run dev

We will manually make an API call to create a first user:

    curl http://127.0.0.1:8000/api/users -X POST --header "Content-Type: application/json" -d '{"email": "charles.law@gmail.com", "password": "Mypass1@#", "confirmPassword": "Mypass1@#"}'




## Development: Getting Started

### Tech Stack

This uses several libraries that would be good to get familiar with:

* react: for drawing the UI
* redux: for managing state of the UI
* sagas: for making API calls
* jsx control statements: not build into react, but everyone's doing it
* prettier/eslint for formatting and some high level error checking

The server tech stack does not really mean anything, the goal is to build a UI.
But for the sake of completeness, and to save time for anyone who would just
poke around the code anyways, the server users:

* express for the web framework to handling incoming API requests
* postgres (postgresql/psql) for the DB
* postgrator for DB migrations (and setup)
* jwt (json web tokens) for sessions

Also note, the UI and API are independent. They both happen to use
JavaScript, but the API could easily have been written (or be rewritten) in
Python or Golang. Be aware of what commands run from the root directory
(for the API) or the `ui/` directory for the UI.


### Tools:

You hopefully have an IDE set up. If you don't have one, VS Code is a good
and safe option.

It helps immesely to have Redux Dev Tools installed for your browser. This
makes debugging much much faster and easier.

### Cheatsheet commands

For the API, in the repo's root directory, there is a single command that
will be used 95% of the time.  It is the command to run the server:

    npm run dev

For the UI, in the `ui/` directory, there are three command that will
cover most casesL

    # Reformat the code nicely
    npm run format
    # Build the development build
    npm run build:dev
    # Build the production build
    npm run build:prod




# REST API

The REST API for Trello-Clone is described below.

# Create User's Account

Create an account for a new user if that user does not already exist. Each user can only have one account associated with an email address.

**URL** : `/api/users/`

**Method** : `POST`

**Auth required** : NO

**Permissions required** : None

**Data constraints**

Provide email address, password, and comfirmation password.

```json
{
  "email": "newacc@newacc.com",
  "password": "newpassword",
  "confirmPassword": "newpassword"
}
```

## Success Response

**Condition** : If everything is OK and an Account didn't exist for this email address.

**Code** : `201 CREATED`

## Error Responses

**Condition** : If email, password or confirm password fields are missing in request body

**Code** : `400`

```json
{
  "error": "Missing '${field}' in request body"
}
```

**Condition** : If email is already taken

**Code** : `400`

```json
{
  "error": "Email already taken"
}
```

# Get all boards

Fetch all boards from db based on users id

**URL** : `/api/boards/`

**Method** : `GET`

**Auth required** : YES

## Success Responses

**Condition** : User contains valid JWT

**Code** : `200 OK`

**Content** : all boards are returned based on users id

```json
{
  "id": "board.id",
  "title": "xss(board.title)",
  "date_created": "board.date_created",
  "user_id": "board.user_id"
}
```

# Create new board

Create a new board with a board title based on users input

**URL** : `/api/boards/`

**Method** : `POST`

**Auth required** : YES

**Data constraints**

Provide title of Board to be created.

```json
{
  "title": "board title"
}
```

**Data example** Title must be sent.

```json
{
  "title": "New Project"
}
```

## Success Response

**Condition** : If everything is OK, board title was sent and a new board is created.

**Code** : `201 CREATED`

**Content example**

```json
{
  "id": "board.id",
  "title": "xss(board.title)",
  "date_created": "board.date_created",
  "user_id": "board.user_id"
}
```

# Delete a users board

Delete the board of the Authenticated User

**URL** : `/api/boards/delete/:boardId/`

**URL Parameters** : `boardId=integer` where `boardId` is the ID of the board in the
database.

**Method** : `DELETE`

**Auth required** : YES

## Success Response

**Condition** : If the board exists.

**Code** : `204 NO CONTENT`

# Get all lists

Fetch all lists from db based on users id

**URL** : `/api/lists/:boardId/`

**URL Parameters** : `boardId=[integer]` where `boardId` is the id of the board associated with the lists being fetched from the database

**Method** : `GET`

**Auth required** : YES

## Success Responses

**Condition** : User contains valid JWT, lists exist associated with the board id

**Code** : `200 OK`

**Content** : all lists are returned based on the board id

```json
{
  "id": "list.id",
  "list_title": "xss(list.list_title)",
  "date_created": "list.date_created",
  "user_id": "list.user_id",
  "board_id": "list.board_id"
}
```

# Create new list

Create a new list associated with a board based on the boards id as long as a list title is submitted with request

**URL** : `/api/lists/`

**Method** : `POST`

**Auth required** : YES

**Data constraints**

Provide title of the List to be created and the board id that the list will belong too

```json
{
  "list_title": "list title",
  "board_id": "boardId"
}
```

**Data example** Title and board id must be sent

```json
{
  "list_title": "To Do",
  "board_id": "2"
}
```

## Success Response

**Condition** : If everything is OK, list title and board id were sent and a new list is created.

**Code** : `201 CREATED`

**Content example**

```json
{
  newList
}
```

# Delete a list

Delete the list of the Authenticated User

**URL** : `/api/boards/delete/:listId/`

**URL Parameters** : `listId=integer` where `listId` is the ID of the list to be deleted.

**Method** : `DELETE`

**Auth required** : YES

## Success Response

**Condition** : If the list exists.

**Code** : `204 NO CONTENT`

# Get all tasks

Fetch all tasks from db based on the list id

**URL** : `/api/tasks/:listId/`

**URL Parameters** : `listId=[integer]` where `listId` is the id of the list associated with the tasks being fetched from the database

**Method** : `GET`

**Auth required** : YES

## Success Responses

**Condition** : User contains valid JWT, tasks exist associated with the list id

**Code** : `200 OK`

**Content** : all tasks are returned based on the list id

```json
{
  tasksAssociatedWithlistId
}
```

# Create new task

Create a new task associated with a list based on the lists id as long as a task title is submitted with request

**URL** : `/api/tasks/`

**Method** : `POST`

**Auth required** : YES

**Data constraints**

Provide title of the task to be created and the list id that the task will be associated with

```json
{
  task
}
```

**Data example** Title and list id must be sent

```json
{
  "title": "start project",
  "list_id": "2"
}
```

## Success Response

**Condition** : If everything is OK, task title and list id were sent and a new task is created.

**Code** : `201 CREATED`

**Content example**

```json
{
  task
}
```

# Delete a task

Delete the task of the Authenticated User

**URL** : `/api/boards/delete/:taskId/`

**URL Parameters** : `taskId=[integer]` where `taskId` is the ID of the task to be deleted.

**Method** : `DELETE`

**Auth required** : YES

## Success Response

**Condition** : If the task exists.

**Code** : `204 NO CONTENT`
