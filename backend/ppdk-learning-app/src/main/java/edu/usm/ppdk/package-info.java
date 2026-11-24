/**
 * Keep Application in the parent package so Spring can scan the other modules.
 * Use Application as the startup class name.
 * @SpringBootApplication and SpringApplication belong to the App startup dependencies.
 * Use the existing Application.java entry point for startup and assembly. Keep business orchestration in Case.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) { SpringApplication.run(Application.class, args); }
}
END PACKAGE EXAMPLE */
