## Afripay Express

Afripay express is a fintech application that enables users to initiate cross-border money transfers across african countries with ease. The app should offer real-time exchange rate information, low transaction fees, and quick delivery of funds.

## Services

- [Authentication service](./user/): This service would be responsible for authentication and authorization users. STack would include Nestjs, Postgres, Prisma.

- [Transaction service](./transaction/): This service would be responsible for performing the core financial operations of the app. It would be built using express, typescript, prisma and postgres and Flutterwave or paystack.

- [Notification service](./notification/): This would be responsible for handling email and push notifications. It would be built using either fastapi or golang and mongodb.

## User FLow

- User signs up with mobile number and requests mobile verification.
- User completes account information if mobile verification is successful.
- User requests for BVN verification.
- A Wallet and virtual account is created upon BVN verification.
- User funds his/her account by bank transfer.
- User can create a virtual card.
- User can make transfers, purchase airtimes etc.

## Requirements

- [Docker](https://www.docker.com/) is a software platform that allows you to build, test, and deploy applications quickly using containers. It automates the deployment of software applications inside containers by providing an additional layer of abstraction and automation of OS-level virtualization on Linux.

- [Docker Compose](https://docs.docker.com/compose/) is a tool for defining and running multi-container applications. It is the key to unlocking a streamlined and efficient development and deployment experience. Compose simplifies the control of your entire application stack, making it easy to manage services, networks, and volumes in a single, comprehensible YAML configuration file. Then, with a single command, you create and start all the services from your configuration file.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## License

Nest is [MIT licensed](LICENSE).

## Developer

[Alahira Jeffrey](https://github.com/alahirajeffrey)
