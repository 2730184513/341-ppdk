/**
 * Protocol entry points map API requests, delegate to Case, and convert responses. Business rules belong in the application and domain layers.
 * Use OrderController, OrderListener, or OrderJob for protocol entry points.
 * Depend on API, Case, and the protocol framework. Avoid direct Domain and Infrastructure dependencies.
 * Organize entry points under http, mq, job, or rpc and delegate use cases to Case.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.trigger;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
// Entry-point location: trigger.http.OrderController.
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import edu.usm.ppdk.cases.xxx.IOrderCase;
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;
import edu.usm.ppdk.api.dto.OrderResponseDTO;
import edu.usm.ppdk.api.response.Response;

@RestController
@RequestMapping("/orders")
public final class OrderController {
    private final IOrderCase orderCase;
    public OrderController(IOrderCase orderCase) { this.orderCase = orderCase; }
    @PostMapping("/query")
    public Response<OrderResponseDTO> query(@RequestBody OrderQueryRequestDTO request) {
        return orderCase.query(request);
    }
}
END PACKAGE EXAMPLE */
