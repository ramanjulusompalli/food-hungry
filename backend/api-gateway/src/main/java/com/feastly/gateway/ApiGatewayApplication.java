package com.feastly.gateway;

import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

@SpringBootApplication
public class ApiGatewayApplication {
  private static final Logger log = LoggerFactory.getLogger(ApiGatewayApplication.class);

  public static void main(String[] args) {
    log.info("Starting api-gateway");
    SpringApplication.run(ApiGatewayApplication.class, args);
  }

  @Bean
  RestTemplate restTemplate(RestTemplateBuilder builder) {
    return builder
        .setConnectTimeout(Duration.ofSeconds(8))
        .setReadTimeout(Duration.ofSeconds(20))
        .build();
  }
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
class GatewayController {
  private static final Logger log = LoggerFactory.getLogger(GatewayController.class);

  private final RestTemplate restTemplate;
  private final String restaurantUrl;
  private final String orderUrl;
  private final String userUrl;

  GatewayController(
      RestTemplate restTemplate,
      @Value("${services.restaurant-url}") String restaurantUrl,
      @Value("${services.order-url}") String orderUrl,
      @Value("${services.user-url}") String userUrl) {
    this.restTemplate = restTemplate;
    this.restaurantUrl = restaurantUrl;
    this.orderUrl = orderUrl;
    this.userUrl = userUrl;
    log.info("Gateway configured. restaurantUrl={} orderUrl={} userUrl={}", restaurantUrl, orderUrl, userUrl);
  }

  @GetMapping("/restaurants")
  ResponseEntity<String> restaurants() {
    log.info("Gateway forwarding GET /api/restaurants to {}", restaurantUrl);
    return getJson(restaurantUrl + "/restaurants", "restaurant-service");
  }

  @GetMapping("/orders")
  ResponseEntity<String> orders() {
    log.info("Gateway forwarding GET /api/orders to {}", orderUrl);
    return getJson(orderUrl + "/orders", "order-service");
  }

  @PostMapping("/orders")
  ResponseEntity<String> createOrder(@RequestBody String payload) {
    log.info("Gateway forwarding POST /api/orders to {} payloadLength={}", orderUrl, payload.length());
    return postJson(orderUrl + "/orders", payload);
  }

  @GetMapping("/users")
  ResponseEntity<String> users() {
    log.info("Gateway forwarding GET /api/users to {}", userUrl);
    return getJson(userUrl + "/users", "user-service");
  }

  @PostMapping("/users/register")
  ResponseEntity<String> register(@RequestBody String payload) {
    log.info("Gateway forwarding POST /api/users/register to {} payloadLength={}", userUrl, payload.length());
    return postJson(userUrl + "/users/register", payload);
  }

  @PostMapping("/users/login")
  ResponseEntity<String> login(@RequestBody String payload) {
    log.info("Gateway forwarding POST /api/users/login to {} payloadLength={}", userUrl, payload.length());
    return postJson(userUrl + "/users/login", payload);
  }

  private ResponseEntity<String> postJson(String url, String payload) {
    log.debug("Gateway POST JSON target={}", url);
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<String> request = new HttpEntity<>(payload, headers);
    try {
      return restTemplate.postForEntity(url, request, String.class);
    } catch (RestClientException error) {
      log.error("Gateway POST failed. target={} message={}", url, error.getMessage(), error);
      return gatewayError("Downstream POST failed", url, error);
    }
  }

  private ResponseEntity<String> getJson(String url, String serviceName) {
    try {
      return restTemplate.getForEntity(url, String.class);
    } catch (RestClientException error) {
      log.error("Gateway GET failed. service={} target={} message={}", serviceName, url, error.getMessage(), error);
      return gatewayError(serviceName + " is not reachable", url, error);
    }
  }

  private ResponseEntity<String> gatewayError(String message, String target, RestClientException error) {
    String body = """
        {"error":"%s","target":"%s","details":"%s"}
        """.formatted(
            escape(message),
            escape(target),
            escape(error.getMessage()));
    return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
        .contentType(MediaType.APPLICATION_JSON)
        .body(body);
  }

  private String escape(String value) {
    if (value == null) {
      return "";
    }
    return value.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
