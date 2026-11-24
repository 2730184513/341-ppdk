/**
 * Scheduled entry points delegate to Case. Scheduling requires explicit application configuration.
 * Use OrderJob for the example job entry point.
 * Use Spring @Component, @Value, and @Scheduled. Enable and configure scheduling in App as needed.
 * Trigger the case on schedule. Configure frequency, concurrency, and retries to match deployment requirements.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.trigger.job;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import edu.usm.ppdk.cases.xxx.IOrderCase;
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;

@Component
public class OrderJob {
    private final IOrderCase orderCase;
    private final String orderId;
    public OrderJob(IOrderCase orderCase, @Value("${jobs.order-id}") String orderId) {
        this.orderCase = orderCase;
        this.orderId = orderId;
    }
    @Scheduled(fixedDelayString = "${jobs.order-query-delay-ms}")
    public void queryConfiguredOrder() {
        var response = orderCase.query(new OrderQueryRequestDTO(orderId));
        System.getLogger(OrderJob.class.getName()).log(System.Logger.Level.INFO,
                "Order query completed: {0}", response.data().orderId());
    }
}
END PACKAGE EXAMPLE */
