import { expect } from "chai";
import { ethers } from "hardhat";
import { MovieMeter } from "../typechain-types"; // Import the generated MovieMeter type

describe("MovieMeter Contract", function () {
  let movieMeter: MovieMeter;
  let owner: any;
  let user: any;

  beforeEach(async function () {
    // Get the signers for the owner and the user
    [owner, user] = await ethers.getSigners();
    
    // Deploy the contract
    const MovieMeterFactory = await ethers.getContractFactory("MovieMeter");
    movieMeter = await MovieMeterFactory.deploy();
  });

  it("Should allow the owner to add a movie", async function () {
    // Owner adds a movie
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");

    // Get the movie details to verify it was added
    const movie_1 = await movieMeter.getMovie("Sixth Sense");
    expect(movie_1[0]).to.equal(1); // Title should match
    expect(movie_1[1]).to.equal("ipfsHashSS"); // IPFS hash should match
    expect(movie_1[2]).to.equal(0); // Average rating should be 0

    // Owner adds a movie
    await movieMeter.addMovie("Star Wars", "ipfsHashSW");

    // Get the movie details to verify it was added
    const movie_2 = await movieMeter.getMovie("Star Wars");
    expect(movie_2[0]).to.equal(2); // Title should match
    expect(movie_2[1]).to.equal("ipfsHashSW"); // IPFS hash should match
    expect(movie_2[2]).to.equal(0); // Average rating should be 0
  });

  it("Should allow users to rate a movie", async function () {
    // Owner adds a movie
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");

    // User rates the movie with a rating of 5
    await movieMeter.connect(user).rateMovie(1, 5);

    // Get the average rating of the movie
    const rating = await movieMeter.getAverageRating(1);
    expect(rating).to.equal(5); // Rating should be 5
  });

  it("Should allow users to overwrite their reviews", async function () {
    // Owner adds a movie
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");

    // User rates the movie with a rating of 4
    await movieMeter.connect(user).rateMovie(1, 4);

    // User updates their rating to 3
    await movieMeter.connect(user).rateMovie(1, 3);

    // Get the average rating of the movie
    const rating = await movieMeter.getAverageRating(1);
    expect(rating).to.equal(3); // Rating should be updated to 3
  });

  it("Should allow users to rate multiple movies", async function () {
    // Owner adds two movies
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");
    await movieMeter.addMovie("Star Wars", "ipfsHashSW");

    // User rates both movies
    await movieMeter.connect(user).rateMovie(1, 4); // Rate Sixth Sense 4
    await movieMeter.connect(user).rateMovie(2, 5); // Rate Star Wars 5

    // Get the average ratings for both movies
    const ratingSixthSense = await movieMeter.getAverageRating(2);
    const ratingStarWars = await movieMeter.getAverageRating(1);

    expect(ratingSixthSense).to.equal(5); // Average rating for Sixth Sense should be 4
    expect(ratingStarWars).to.equal(4); // Average rating for Star Wars should be 5
  });

  it("Should prevent non-owner from adding movies", async function () {
    // Try to add a movie as a non-owner
    await expect(movieMeter.connect(user).addMovie("Star Wars", "ipfsHashSW"))
      .to.be.revertedWith("Only owner can perform this action");
  });

  it("Should prevent invalid ratings", async function () {
    // Owner adds a movie
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");

    // Try to rate the movie with an invalid rating (less than 1)
    await expect(movieMeter.connect(user).rateMovie(1, 0)).to.be.revertedWith("Invalid rating value");

    // Try to rate the movie with an invalid rating (greater than 5)
    await expect(movieMeter.connect(user).rateMovie(1, 6)).to.be.revertedWith("Invalid rating value");
  });

  it("Should prevent accessing invalid movie", async function () {
    // Try to get a movie that does not exist
    await expect(movieMeter.getMovie("Abba Dabba"))
      .to.be.revertedWith("Movie not found");
  });

  it("Should update the movie's total rating and number of ratings correctly", async function () {
    // Owner adds a movie
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");

    // Users rate the movie
    await movieMeter.connect(user).rateMovie(1, 5);
    await movieMeter.connect(owner).rateMovie(1, 4);

    // Get the average rating
    const averageRating = await movieMeter.getAverageRating(1);
    console.log("averageRating",averageRating);
    expect(averageRating).to.equal(4); // (5 + 4) / 2 = 4

    // Verify the total ratings and number of ratings
    const movie = await movieMeter.getMovie("Sixth Sense");
    expect(movie[2]).to.equal(4); // Average rating should be 4
    expect(movie[3]).to.equal(9); // Total ratings should be 5 + 4 = 9
    expect(movie[4]).to.equal(2); // Number of ratings should be 2
  });

  it("Should allow a user to overwrite their rating without affecting the number of ratings", async function () {
    // Owner adds a movie
    await movieMeter.addMovie("Sixth Sense", "ipfsHashSS");

    // User rates the movie with a rating of 4
    await movieMeter.connect(user).rateMovie(1, 4);

    // User updates their rating to 3
    await movieMeter.connect(user).rateMovie(1, 3);

    // Get the average rating of the movie
    const rating = await movieMeter.getAverageRating(1);
    expect(rating).to.equal(3); // Rating should be updated to 3

    // Verify the total ratings and number of ratings are correct
    const movie = await movieMeter.getMovie("Sixth Sense");
    expect(movie[2]).to.equal(3); // Average rating should be 3
    expect(movie[3]).to.equal(3); // Total ratings should be 3 (previous 4 + new 3)
    expect(movie[4]).to.equal(1); // Number of ratings should still be 1 (since it's an overwrite)
  });
});