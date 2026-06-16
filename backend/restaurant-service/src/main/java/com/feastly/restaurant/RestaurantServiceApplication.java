package com.feastly.restaurant;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
public class RestaurantServiceApplication {
  private static final Logger log = LoggerFactory.getLogger(RestaurantServiceApplication.class);

  public static void main(String[] args) {
    log.info("Starting restaurant-service");
    SpringApplication.run(RestaurantServiceApplication.class, args);
  }
}

record MenuItem(String id, String name, int price, boolean bestseller) {}

record Restaurant(
    long id,
    String name,
    String cuisine,
    double rating,
    String eta,
    String offer,
    String image,
    List<String> tags,
    List<MenuItem> menu) {}

@RestController
@RequestMapping("/restaurants")
@CrossOrigin(origins = "*")
class RestaurantController {
  private static final Logger log = LoggerFactory.getLogger(RestaurantController.class);

  private final List<Restaurant> restaurants = List.of(
      new Restaurant(
          1,
          "Bombay Bowl House",
          "North Indian",
          4.7,
          "24-30 min",
          "40% off up to Rs 120",
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
          List.of("Biryani", "Paneer", "Thali"),
          List.of(
              new MenuItem("bbh-1", "Butter Paneer Bowl", 229, true),
              new MenuItem("bbh-2", "Lucknowi Veg Biryani", 249, false),
              new MenuItem("bbh-3", "Dal Makhani Meal", 199, false))),
      new Restaurant(
          2,
          "Tandoor Street",
          "Mughlai",
          4.5,
          "18-25 min",
          "Free delivery",
          "https://images.unsplash.com/photo-1628294896516-344152572ee8?auto=format&fit=crop&w=900&q=80",
          List.of("Kebabs", "Rolls", "Naan"),
          List.of(
              new MenuItem("ts-1", "Chicken Tikka Roll", 179, true),
              new MenuItem("ts-2", "Tandoori Platter", 349, false),
              new MenuItem("ts-3", "Roomali Roti Combo", 149, false))),
      new Restaurant(
          3,
          "Urban Dosa Co.",
          "South Indian",
          4.8,
          "20-28 min",
          "Buy 1 Get 1",
          "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80",
          List.of("Dosa", "Idli", "Filter Coffee"),
          List.of(
              new MenuItem("ud-1", "Ghee Roast Masala Dosa", 159, true),
              new MenuItem("ud-2", "Podi Idli Basket", 129, false),
              new MenuItem("ud-3", "Mini Tiffin Combo", 189, false))));

  @GetMapping
  List<Restaurant> all() {
    log.info("Fetching all restaurants. count={}", restaurants.size());
    return restaurants;
  }

  @GetMapping("/{id}")
  Restaurant one(@PathVariable long id) {
    log.info("Fetching restaurant by id={}", id);
    Restaurant restaurant = restaurants.stream()
        .filter(restaurant -> restaurant.id() == id)
        .findFirst()
        .orElseThrow();
    log.info("Restaurant found. id={} name={}", restaurant.id(), restaurant.name());
    return restaurant;
  }
}
