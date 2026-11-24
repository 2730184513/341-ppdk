/**
 * Example RPC provider that implements an API contract and delegates to Case. RPC must be configured separately.
 * Use OrderRpcProvider implements IOrderQueryService for the RPC provider.
 * Depend on API and Case. @DubboService requires the Dubbo integration dependency.
 * Implement the public API and delegate to Case. Configure RPC registration, address, and activation in the deployment.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.trigger.rpc;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.apache.dubbo.config.annotation.DubboService;
import edu.usm.ppdk.api.IOrderQueryService;
import edu.usm.ppdk.api.dto.OrderQueryRequestDTO;
import edu.usm.ppdk.api.dto.OrderResponseDTO;
import edu.usm.ppdk.api.response.Response;
import edu.usm.ppdk.cases.xxx.IOrderCase;

@DubboService
public final class OrderRpcProvider implements IOrderQueryService {
    private final IOrderCase orderCase;
    public OrderRpcProvider(IOrderCase orderCase) { this.orderCase = orderCase; }
    @Override
    public Response<OrderResponseDTO> query(OrderQueryRequestDTO request) { return orderCase.query(request); }
}
END PACKAGE EXAMPLE */
