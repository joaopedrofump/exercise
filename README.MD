# Sword practical exercise

Repository to demonstrate the result of practical exercise.

# Stack
- NodeJS
- Hivemq community edition
- React
- Jest

# Tests

To run the tests in the root of the project run **"docker-compose -f docker-compose-test.yaml up --build"**. In the end run **"docker-compose -f docker-compose-test.yaml down -v"**.

If for some reason the tests do not run inside the container go the the api folder and run **"npm install"** to install dependencies, then run **"docker-compose up --build"** and when all the containers are up and running run **"npm run local-tests"**.

If this does not work as well after all the containers are up and running with **"docker-compose up --build"** open a bash session in the api container with **"docker exec -it api bash"** and in the bash run **"npm test"**.

## Development Environment

To mount the development environment go to the root of the project and run **"docker-compose up --build"**. Sometimes the api container spins up faster than the database. If that happens, go to some api file and make a change as the api and frontend containers are in watch mode and get recompiled again.

After all the containers are up and running open the browser and go to "localhost:9003". The passwords for testing are all '123456aA!' (without the quotes) and the usernames are:

	- manager1 (Manager Profile)
	- manager2 (Manager Profile)
	- tech1 (Technician Profile)
	- tech2 (Technician Profile)
	- tech3 (Technician Profile)
	- tech4 (Technician Profile)

**Functionalities implemented**

 - *api*
	 - tasks
		 - create-task (only by techs)
		 - list all tasks (all for managers, only own tasks for techs)
		 - complete task (only by tech and their own tasks)
		 - delete task (tech their own tasks and manager all tasks)
	 - auth
		 - creation of user
		 - login
		 - logout
		 - session refresh
		 - cookie session
		 - middleware to intercept cookie to secure the necessary endpoints
 - *broker*: publish creation, deletion and completion of tasks
 - *fe*
	 - login
	 - logout
	 - list of tasks
	 - crete task
	 - complete task
	 - delete task
	 - notifications

- *unit tests*
	- api controller
- missing
	- fe responsiveness
	- unit test to mock http requests
    - notifications to techs when managers delete their tasks