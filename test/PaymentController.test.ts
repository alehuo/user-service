process.env.NODE_ENV = "test";

import * as JWT from "jsonwebtoken";
import "mocha";
import * as Knex from "knex";
import app from "./../src/App";

import payments = require("./../seeds/seedData/payments");
import Payment from "../src/models/Payment";

// Knexfile
const knexfile = require("./../knexfile");
// Knex instance
const knex = Knex(knexfile["test"]);

const chai: Chai.ChaiStatic = require("chai");
const should = chai.should();
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

const url: string = "/api/payments";

const kjyrIdentifier: string = "433f7cd9-e7db-42fb-aceb-c3716c6ef2b7";
const calendarIdentifier: string = "65a0058d-f9da-4e76-a00a-6013300cab5f";
const generateToken = (
  userId: number,
  authenticatedTo: string[] = [kjyrIdentifier, calendarIdentifier],
  createdAt: Date = new Date()
): string =>
  JWT.sign(
    {
      userId: userId,
      authenticatedTo: authenticatedTo.join(","),
      createdAt: createdAt
    },
    process.env.JWT_SECRET
  );

describe("PaymentController", () => {
  // Roll back
  beforeEach(done => {
    knex.migrate.rollback().then(() => {
      knex.migrate.latest().then(() => {
        knex.seed.run().then(() => {
          done();
        });
      });
    });
  });

  // After each
  afterEach(done => {
    knex.migrate.rollback().then(() => {
      done();
    });
  });

  describe("Returns all payments", () => {
    it("As an authenticated user, returns all payments", done => {
      chai
        .request(app)
        .get(url)
        .set("Authorization", "Bearer " + generateToken(1))
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res.body.ok);
          should.exist(res.body.payload);
          should.not.exist(res.body.message);
          res.status.should.equal(200);
          res.body.payload.length.should.equal(payments.length);
          res.body.ok.should.equal(true);

          for (let i: number = 0; i < res.body.payload.length; i++) {
            should.exist(res.body.payload[i]);
            should.exist(res.body.payload[i].id);
            should.exist(res.body.payload[i].payer_id);
            should.exist(res.body.payload[i].confirmer_id);
            should.exist(res.body.payload[i].created);
            should.exist(res.body.payload[i].reference_number);
            should.exist(res.body.payload[i].amount);
            should.exist(res.body.payload[i].valid_until);
            should.exist(res.body.payload[i].paid);
            should.exist(res.body.payload[i].payment_type);

            const payment_2 = payments[i];
            res.body.payload[i].id.should.equal(payment_2.id);
            res.body.payload[i].payer_id.should.equal(payment_2.payer_id);
            res.body.payload[i].confirmer_id.should.equal(
              payment_2.confirmer_id
            );
            Date.parse(res.body.payload[i].created).should.equal(
              Date.parse(payment_2.created.toLocaleDateString())
            );
            res.body.payload[i].reference_number.should.equal(
              payment_2.reference_number
            );
            parseFloat(res.body.payload[i].amount).should.equal(
              payment_2.amount
            );
            Date.parse(res.body.payload[i].valid_until).should.equal(
              Date.parse(payment_2.valid_until.toLocaleDateString())
            );
            Date.parse(res.body.payload[i].paid).should.equal(
              Date.parse(payment_2.paid.toLocaleDateString())
            );
            res.body.payload[i].payment_type.should.equal(
              payment_2.payment_type
            );
          }
          done();
        });
    });

    it("As an unauthenticated user, returns unauthorized", done => {
      chai
        .request(app)
        .get(url)
        .end((err, res) => {
          should.exist(res.body.ok);
          should.exist(res.body.message);
          should.not.exist(res.body.payload);
          res.body.ok.should.equal(false);
          res.body.message.should.equal("Unauthorized");
          res.status.should.equal(401);
          done();
        });
    });
  });

  describe("Returns a single payment", () => {
    it("As an authenticated user, returns a single payment", done => {
      chai
        .request(app)
        .get(url + "/1")
        .set("Authorization", "Bearer " + generateToken(1))
        .end((err, res) => {
          res.status.should.equal(200);
          should.exist(res.body.ok);
          should.exist(res.body.payload);
          should.not.exist(res.body.message);
          should.exist(res.body.payload.id);
          should.exist(res.body.payload.payer_id);
          should.exist(res.body.payload.confirmer_id);
          should.exist(res.body.payload.created);
          should.exist(res.body.payload.reference_number);
          should.exist(res.body.payload.amount);
          should.exist(res.body.payload.valid_until);
          should.exist(res.body.payload.paid);
          should.exist(res.body.payload.payment_type);
          res.body.ok.should.equal(true);
          const payment_2 = payments[0];
          res.body.payload.id.should.equal(payment_2.id);
          res.body.payload.payer_id.should.equal(payment_2.payer_id);
          res.body.payload.confirmer_id.should.equal(payment_2.confirmer_id);
          Date.parse(res.body.payload.created).should.equal(
            Date.parse(payment_2.created.toLocaleDateString())
          );
          res.body.payload.reference_number.should.equal(
            payment_2.reference_number
          );
          parseFloat(res.body.payload.amount).should.equal(payment_2.amount);
          Date.parse(res.body.payload.valid_until).should.equal(
            Date.parse(payment_2.valid_until.toLocaleDateString())
          );
          Date.parse(res.body.payload.paid).should.equal(
            Date.parse(payment_2.paid.toLocaleDateString())
          );
          res.body.payload.payment_type.should.equal(payment_2.payment_type);
          done();
        });
    });

    it("As an unauthenticated user, returns unauthorized", done => {
      chai
        .request(app)
        .get(url + "/1")
        .end((err, res) => {
          should.exist(res.body.ok);
          should.exist(res.body.message);
          should.not.exist(res.body.payload);
          res.body.ok.should.equal(false);
          res.body.message.should.equal("Unauthorized");
          res.status.should.equal(401);
          done();
        });
    });
  });

  describe("Adds a new payment", () => {
    it("As an unauthenticated user, returns unauthorized", done => {
      const newPayment = {
        payer_id: 2,
        confirmer_id: 1,
        created: new Date(2013, 1, 1),
        reference_number: "1212121212",
        amount: 44.44,
        valid_until: new Date(2018, 1, 1),
        paid: new Date(2013, 1, 1),
        payment_type: "jasenmaksu"
      };
      chai
        .request(app)
        .post(url)
        .send(newPayment)
        .end((err, res) => {
          should.exist(res.body.ok);
          should.exist(res.body.message);
          should.not.exist(res.body.payload);
          res.body.ok.should.equal(false);
          res.body.message.should.equal("Unauthorized");
          res.status.should.equal(401);
          done();
        });
    });

    it("As an authenticated user, adds a new payment", done => {
      const newPayment = {
        payer_id: 2,
        confirmer_id: 1,
        created: new Date(2013, 1, 1),
        reference_number: "1212121212",
        amount: 44.44,
        valid_until: new Date(2018, 1, 1),
        paid: new Date(2013, 1, 1),
        payment_type: "jasenmaksu"
      };
      chai
        .request(app)
        .post(url)
        .set("Authorization", "Bearer " + generateToken(1))
        .send(newPayment)
        .end((err, res) => {
          res.status.should.equal(201);
          should.exist(res.body.ok);
          should.exist(res.body.payload);
          should.exist(res.body.payload.id);
          should.exist(res.body.payload.payer_id);
          should.exist(res.body.payload.confirmer_id);
          should.exist(res.body.payload.created);
          should.exist(res.body.payload.reference_number);
          should.exist(res.body.payload.amount);
          should.exist(res.body.payload.valid_until);
          should.exist(res.body.payload.paid);
          should.exist(res.body.payload.payment_type);
          res.body.ok.should.equal(true);
          res.body.message.should.equal("Payment created");
          res.body.payload.id.should.equal(payments.length + 1);
          res.body.payload.payer_id.should.equal(newPayment.payer_id);
          res.body.payload.confirmer_id.should.equal(newPayment.confirmer_id);
          /*Date.parse(res.body.payload.created).should.equal(
            Date.parse(newPayment.created.toLocaleDateString())
          );*/
          res.body.payload.reference_number.should.equal(
            newPayment.reference_number
          );
          parseFloat(res.body.payload.amount).should.equal(newPayment.amount);
          /*Date.parse(res.body.payload.valid_until).should.equal(
            Date.parse(newPayment.valid_until.toLocaleDateString())
          );
          Date.parse(res.body.payload.paid).should.equal(
            Date.parse(newPayment.paid.toLocaleDateString())
          );*/
          res.body.payload.payment_type.should.equal(newPayment.payment_type);

          // Next, get all post and check for a match
          chai
            .request(app)
            .get(url)
            .set("Authorization", "Bearer " + generateToken(1))
            .end((err, res) => {
              should.not.exist(err);
              should.exist(res.body.ok);
              should.exist(res.body.payload);
              should.not.exist(res.body.message);
              res.status.should.equal(200);
              // Check addition of post
              res.body.payload.length.should.equal(payments.length + 1);
              res.body.ok.should.equal(true);

              // Loop through

              // Old entries
              for (let i: number = 0; i < res.body.payload.length - 1; i++) {
                should.exist(res.body.payload[i]);
                should.exist(res.body.payload[i].id);
                should.exist(res.body.payload[i].payer_id);
                should.exist(res.body.payload[i].confirmer_id);
                should.exist(res.body.payload[i].created);
                should.exist(res.body.payload[i].reference_number);
                should.exist(res.body.payload[i].amount);
                should.exist(res.body.payload[i].valid_until);
                should.exist(res.body.payload[i].paid);
                should.exist(res.body.payload[i].payment_type);

                const payment_2 = payments[i];
                res.body.payload[i].id.should.equal(payment_2.id);
                res.body.payload[i].payer_id.should.equal(payment_2.payer_id);
                res.body.payload[i].confirmer_id.should.equal(
                  payment_2.confirmer_id
                );
                /*Date.parse(res.body.payload[i].created).should.equal(
                  Date.parse(payment_2.created.toLocaleDateString())
                );*/
                res.body.payload[i].reference_number.should.equal(
                  payment_2.reference_number
                );
                parseFloat(res.body.payload[i].amount).should.equal(
                  payment_2.amount
                );
                /*Date.parse(res.body.payload[i].valid_until).should.equal(
                  Date.parse(payment_2.valid_until.toLocaleDateString())
                );
                Date.parse(res.body.payload[i].paid).should.equal(
                  Date.parse(payment_2.paid.toLocaleDateString())
                );*/
                res.body.payload[i].payment_type.should.equal(
                  payment_2.payment_type
                );
              }

              // New entry
              const payment_2 = res.body.payload[2];
              payment_2.id.should.equal(3);
              payment_2.payer_id.should.equal(newPayment.payer_id);
              payment_2.confirmer_id.should.equal(newPayment.confirmer_id);
              /*Date.parse(payment_2.created).should.equal(
                Date.parse(newPayment.created.toLocaleDateString())
              );*/
              payment_2.reference_number.should.equal(
                newPayment.reference_number
              );
              parseFloat(payment_2.amount).should.equal(newPayment.amount);
              /*Date.parse(payment_2.valid_until).should.equal(
                Date.parse(newPayment.valid_until.toLocaleDateString())
              );
              Date.parse(payment_2.paid).should.equal(
                Date.parse(newPayment.paid.toLocaleDateString())
              );*/
              payment_2.payment_type.should.equal(newPayment.payment_type);
              done();
            });
        });
    });
  });

  describe("Modifies a payment", () => {
    it("Can modify a payment, with valid information", done => {
      // First, fetch a payment that will be modified.
      chai
        .request(app)
        .get(url + "/1")
        .set("Authorization", "Bearer " + generateToken(1))
        .end((err, res) => {
          const payment: Payment = res.body.payload;
          // Set reference number and payment type, except them to be changed
          const newRefNum: string = "00000001111111";
          const newPaymentType: string = "HelloWorld";
          // Then, do a PATCH request
          chai
            .request(app)
            .patch(url + "/" + payment.id)
            .set("Authorization", "Bearer " + generateToken(1))
            .send(
              Object.assign({}, payment, {
                reference_number: newRefNum,
                payment_type: newPaymentType
              })
            )
            .end((err, res) => {
              should.exist(res.body.ok);
              should.exist(res.body.message);
              should.exist(res.body.payload);
              should.exist(res.body.payload.id);
              should.exist(res.body.payload.payer_id);
              should.exist(res.body.payload.created);
              should.exist(res.body.payload.reference_number);
              should.exist(res.body.payload.amount);
              should.exist(res.body.payload.valid_until);
              should.exist(res.body.payload.paid);
              should.exist(res.body.payload.payment_type);
              res.body.payload.payment_type.should.equal(newPaymentType);
              res.body.payload.reference_number.should.equal(newRefNum);
              res.status.should.equal(200);
              res.body.ok.should.equal(true);
              res.body.message.should.equal("Payment modified");
              done();
            });
        });
    });
/*
    it("Cannot modify a payment, with invalid", done => {
      // First, fetch a payment that will be modified.
      chai
        .request(app)
        .get(url + "/1")
        .set("Authorization", "Bearer " + generateToken(1))
        .end((err, res) => {
          const payment: Payment = res.body.payload;
          // Set reference number and payment type, except them to be changed
          const newRefNum: string = "00000001111111";
          const newPaymentType: string = "HelloWorld";

          // PATCH excepts all object params to exist
          delete payment.confirmer_id;

          // Then, do a PATCH request
          chai
            .request(app)
            .patch(url + "/" + payment.id)
            .set("Authorization", "Bearer " + generateToken(1))
            .send(
              Object.assign({}, payment, {
                reference_number: newRefNum,
                payment_type: newPaymentType
              })
            )
            .end((err, res) => {
              should.exist(res.body.ok);
              should.exist(res.body.message);
              should.not.exist(res.body.payload);
              res.status.should.equal(400);
              res.body.ok.should.equal(false);
              res.body.message.should.equal("Failed to modify payment");
              done();
            });
        });
    });*/
  });
});
