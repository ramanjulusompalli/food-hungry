package com.feastly.user;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class UserServiceApplication {
  private static final Logger log = LoggerFactory.getLogger(UserServiceApplication.class);

  public static void main(String[] args) {
    log.info("Starting user-service");
    SpringApplication.run(UserServiceApplication.class, args);
  }
}

record RegisterRequest(String name, String email, String mobile, String password) {}

record LoginRequest(String email, String password) {}

record AppUser(String id, String name, String email, String mobile, String password, Instant createdAt) {}

record UserResponse(String id, String name, String email, String mobile) {
  static UserResponse from(AppUser user) {
    return new UserResponse(user.id(), user.name(), user.email(), user.mobile());
  }
}

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
class UserController {
  private static final Logger log = LoggerFactory.getLogger(UserController.class);

  private final JdbcTemplate jdbcTemplate;

  private final RowMapper<AppUser> userMapper = (rs, rowNum) -> new AppUser(
      rs.getString("id"),
      rs.getString("name"),
      rs.getString("email"),
      rs.getString("mobile"),
      rs.getString("password"),
      rs.getTimestamp("created_at").toInstant());

  UserController(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  @GetMapping
  List<UserResponse> all() {
    log.info("Fetching all users");
    List<UserResponse> users = jdbcTemplate.query(
            "SELECT id, name, email, mobile, password, created_at FROM app_users ORDER BY created_at DESC",
            userMapper)
        .stream()
        .map(UserResponse::from)
        .toList();
    log.info("Fetched users. count={}", users.size());
    return users;
  }

  @PostMapping("/register")
  UserResponse register(@RequestBody RegisterRequest request) {
    log.info("Register request received. email={} mobile={}", request.email(), request.mobile());
    validateRegister(request);
    boolean emailAlreadyExists = findByEmail(request.email()).isPresent();

    if (emailAlreadyExists) {
      log.warn("Register rejected. email already exists={}", request.email());
      throw new BadRequestException("Email already registered.");
    }

    AppUser user = new AppUser(
        UUID.randomUUID().toString(),
        request.name().trim(),
        request.email().trim(),
        request.mobile().trim(),
        request.password(),
        Instant.now());
    jdbcTemplate.update(
        "INSERT INTO app_users (id, name, email, mobile, password, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        user.id(),
        user.name(),
        user.email(),
        user.mobile(),
        user.password(),
        java.sql.Timestamp.from(user.createdAt()));
    log.info("User registered. id={} email={}", user.id(), user.email());
    return UserResponse.from(user);
  }

  @PostMapping("/login")
  UserResponse login(@RequestBody LoginRequest request) {
    log.info("Login request received. email={}", request.email());
    Optional<AppUser> user = findByEmail(request.email())
        .filter(existing -> existing.password().equals(request.password()));

    if (user.isEmpty()) {
      log.warn("Login rejected. email={}", request.email());
      throw new UnauthorizedException("Invalid email or password.");
    }

    log.info("Login successful. id={} email={}", user.get().id(), user.get().email());
    return UserResponse.from(user.get());
  }

  private Optional<AppUser> findByEmail(String email) {
    if (isBlank(email)) {
      return Optional.empty();
    }

    List<AppUser> matches = jdbcTemplate.query(
        "SELECT id, name, email, mobile, password, created_at FROM app_users WHERE LOWER(email) = LOWER(?)",
        userMapper,
        email.trim());
    log.debug("findByEmail completed. email={} matches={}", email, matches.size());
    return matches.stream().findFirst();
  }

  private void validateRegister(RegisterRequest request) {
    if (isBlank(request.name()) || isBlank(request.email()) || isBlank(request.mobile()) || isBlank(request.password())) {
      throw new BadRequestException("Name, email, mobile, and password are required.");
    }

    if (request.password().length() < 6) {
      throw new BadRequestException("Password must be at least 6 characters.");
    }
  }

  private boolean isBlank(String value) {
    return value == null || value.trim().isEmpty();
  }
}

@ResponseStatus(HttpStatus.BAD_REQUEST)
class BadRequestException extends RuntimeException {
  BadRequestException(String message) {
    super(message);
  }
}

@ResponseStatus(HttpStatus.UNAUTHORIZED)
class UnauthorizedException extends RuntimeException {
  UnauthorizedException(String message) {
    super(message);
  }
}
