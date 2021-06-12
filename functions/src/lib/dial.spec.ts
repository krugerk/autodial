import dial from "./dial";
import * as time from "./time";
import {describe, it} from "@jest/globals";
import {e} from "./test/helpers";

const setNow = (yyyy: number, m: number, d: number) => {
  const value: number = Date.UTC(yyyy, m - 1, d, 12) / 1000;
  jest.spyOn(time, "now").mockReturnValue(value);
};

describe("dial function", () => {
  it("dials goal with no datapoints", () => {
    setNow(2021, 2, 25);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210225", null, 1]],
      datapoints: [],
    });

    e(r[1][2]).toEqual(0);
  });

  it("does not adjust goal with less than 30d history", () => {
    setNow(2021, 1, 25);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    e(r[1][2]).toEqual(1);
  });

  it("dials goal with datapoint after a month", () => {
    setNow(2021, 2, 24);

    const r = dial({
      runits: "d",
      roadall: [["20210124", 0, null], ["20210224", null, 1]],
      datapoints: [["20210124", 0, "initial"], ["20210125", 1, "comment"]],
    });

    const newRate = r[1][2];

    if (newRate === null) throw new Error("num is null");

    e(newRate).toFuzzyEqual(1/30);
  });

  // for now we'll e this to autodial to zero when you've entered no data
  // in a month but eventually we'll want to treat that as a bug. autodialer
  // should never give you an infinitely flat road that never makes you do
  // anything ever again.
  it("dials goal with more than a month of data", () => {
    setNow(2021, 3, 1);

    const r = dial({
      runits: "d",
      roadall: [["20210125", 0, null], ["20210301", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    e(r[1][2]).toEqual(0);
  });

  it("dials goal with datapoint after a week with runits=weekly", () => {
    setNow(2021, 2, 1);

    const r = dial({
      runits: "w",
      roadall: [["20210125", 0, null], ["20210201", null, 1]],
      datapoints: [["20210125", 1, "comment"]],
    });

    const newRate = r[1][2];

    if (newRate === null) throw new Error("num is null");

    e(newRate).toFuzzyEqual(1);
  });

  it("dials goal with min option", () => {
    setNow(2021, 2, 25);

    const r = dial({
      runits: "w",
      roadall: [["20210125", 0, null], ["20210225", null, 1]],
      datapoints: [["20210126", 1, "comment"]],
    }, {min: 2});

    e(r[1][2]).toEqual(2);
  });
});

// TODO:
// add test to ensure support last aggday
// support sum aggday
// do not dial goals with nonstandard kyoom, aggday, odom

// waiting for: api maybe handles kyoom, aggday, odom
