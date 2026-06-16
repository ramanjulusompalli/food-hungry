package com.feastly.order;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class OrderServiceApplication {
  private static final Logger log = LoggerFactory.getLogger(OrderServiceApplication.class);

  public static void main(String[] args) {
    log.info("Starting order-service");
    SpringApplication.run(OrderServiceApplication.class, args);
  }
}

record OrderItem(String menuItemId, String name, int quantity, int unitPrice) {}

record CreateOrderRequest(long restaurantId, String customerName, String address, List<OrderItem> items) {}

record FoodOrder(
    String id,
    long restaurantId,
    String customerName,
    String address,
    List<OrderItem> items,
    int total,
    String status,
    Instant createdAt) {}

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
class OrderController {
  private static final Logger log = LoggerFactory.getLogger(OrderController.class);

  private final List<FoodOrder> orders = new ArrayList<>();

  @GetMapping
  List<FoodOrder> all() {
    log.info("Fetching all orders. count={}", orders.size());
    return orders;
  }

  @GetMapping("/{id}")
  FoodOrder one(@PathVariable String id) {
    log.info("Fetching order by id={}", id);
    FoodOrder order = orders.stream().filter(existing -> existing.id().equals(id)).findFirst().orElseThrow();
    log.info("Order found. id={} status={} total={}", order.id(), order.status(), order.total());
    return order;
  }

  @PostMapping
  FoodOrder create(@RequestBody CreateOrderRequest request) {
    log.info(
        "Creating order. restaurantId={} customerName={} itemCount={}",
        request.restaurantId(),
        request.customerName(),
        request.items() == null ? 0 : request.items().size());
    int subtotal = request.items().stream()
        .mapToInt(item -> item.unitPrice() * item.quantity())
        .sum();
    int delivery = subtotal > 399 ? 0 : 29;
    int taxes = Math.round(subtotal * 0.05f);
    FoodOrder order = new FoodOrder(
        UUID.randomUUID().toString(),
        request.restaurantId(),
        request.customerName(),
        request.address(),
        request.items(),
        subtotal + delivery + taxes,
        "KITCHEN_PREPARING",
        Instant.now());
    orders.add(order);
    log.info("Order created. id={} total={} status={}", order.id(), order.total(), order.status());
    return order;
  }
}
