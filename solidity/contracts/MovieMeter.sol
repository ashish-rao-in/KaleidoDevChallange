// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.17;

contract MovieMeter {
    struct Movie {
        string title;
        string ipfsHash; // IPFS hash for poster/image
        uint256 averageRating;
        uint256 totalRatings;
        uint256 numberOfRatings;
    }

    struct UserReview {
        uint256 movieId;
        uint8 rating;
        bool hasRated;
    }

    address public owner;
    mapping(uint256 => Movie) public movies;
    mapping(address => mapping(uint256 => UserReview)) public userReviews;
    mapping(string => uint256) public titleToMovieId;
    uint256 public movieCount;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    // Add new movie - Assumes movie names are unique
    // TODO: Use may be use a year and name combination to better hash the movies
    function addMovie(string memory _title, string memory _ipfsHash) public onlyOwner {
        require(titleToMovieId[_title]==0, "Movie with this title already exists.");
        movieCount++;
        movies[movieCount] = Movie(_title, _ipfsHash, 0, 0, 0);
        titleToMovieId[_title] = movieCount;
    }

    // Allow users to rate a movie - allows overwriting previous rating
    function rateMovie(uint256 _movieId, uint8 _rating) public {
        require(_movieId > 0 && _movieId <= movieCount, "Invalid movie ID");
        require(_rating >= 1 && _rating <= 5, "Invalid rating value");
        
        Movie storage movie = movies[_movieId];
        UserReview storage review = userReviews[msg.sender][_movieId];
        require(movie.totalRatings <= type(uint256).max - _rating, "Total ratings overflow");

        if (review.hasRated) {
            // If user has rated before, overwrite the previous rating
            uint256 previousRating = review.rating;
            unchecked {
                movie.totalRatings = movie.totalRatings - previousRating + _rating;
            }
        } else {
            movie.totalRatings += _rating;
            movie.numberOfRatings++;
        }

        if (movie.numberOfRatings > 0) {
            movie.averageRating = movie.totalRatings / movie.numberOfRatings;
        } else {
            movie.averageRating = 0;
        }

        // Store the review
        review.movieId = _movieId;
        review.rating = _rating;
        review.hasRated = true;
    }

    // Get average rating of a movie
    function getAverageRating(uint256 _movieId) public view returns (uint256) {
        require(_movieId > 0 && _movieId <= movieCount, "Invalid movie ID");
        return movies[_movieId].averageRating;
    }

    // Get movie details - Assumes that movie names are unique
    function getMovie(string memory _title) public view returns (uint256, string memory, uint256, uint256, uint256) {
        uint256 movieId = titleToMovieId[_title];
        require(movieId > 0, "Movie not found");
        Movie memory movie = movies[movieId];
        return (movieId, movie.ipfsHash, movie.averageRating, movie.totalRatings, movie.numberOfRatings);
    }
}
