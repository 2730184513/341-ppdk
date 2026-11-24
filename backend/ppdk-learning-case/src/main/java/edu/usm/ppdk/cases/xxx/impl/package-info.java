/**
 * Example use-case implementation. Use an XxxCaseImpl to compose domain services, repositories, and ports and map their results.
 * Use OrderCaseImpl for this use-case implementation.
 * Use @Service from the declared Spring Context dependency and inject domain service interfaces through the constructor.
 * Coordinate order and inventory queries and map the API response. This read flow does not guarantee an atomic cross-domain transaction.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.cases.xxx.impl;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.stereotype.Service;
import edu.usm.ppdk.cases.xxx.IOrderCase;
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;
import edu.usm.ppdk.api.dto.OrderResponseDTO;
import edu.usm.ppdk.api.response.Response;
import edu.usm.ppdk.domain.xxx.service.IOrderService;
import edu.usm.ppdk.domain.yyy.service.IInventoryService;

@Service
public class OrderCaseImpl implements IOrderCase {
    private final IOrderService orderService;
    private final IInventoryService inventoryService;
    public OrderCaseImpl(IOrderService orderService, IInventoryService inventoryService) {
        this.orderService = orderService;
        this.inventoryService = inventoryService;
    }
    @Override
    public Response<OrderResponseDTO> query(OrderQueryRequestDTO request) {
        var order = orderService.findById(request.orderId());
        int quantity = inventoryService.availableQuantity(order.productId());
        var response = new OrderResponseDTO(order.orderId(), order.status().value().name(), quantity);
        return new Response<>("SUCCESS", "Order queried", response);
    }
    // Write use cases may use @Transactional with the configured transaction manager. Remote calls do not join the local transaction automatically.
}
END PACKAGE EXAMPLE */
