/**
 * Example use-case implementation for a second domain. Coordinate workflows here and keep business rules in Domain.
 * Use InventoryCaseImpl for this use-case implementation.
 * Use @Service and constructor injection. Depend on domain interfaces instead of DAOs or clients.
 * Coordinate the scenario and map domain results to the public contract. Domain owns business rules.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.cases.yyy.impl;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.stereotype.Service;
import edu.usm.ppdk.cases.yyy.IInventoryCase;
import edu.usm.ppdk.api.dto.InventoryQueryRequestDTO;
import edu.usm.ppdk.api.dto.InventoryResponseDTO;
import edu.usm.ppdk.api.response.Response;
import edu.usm.ppdk.domain.yyy.service.IInventoryService;

@Service
public class InventoryCaseImpl implements IInventoryCase {
    private final IInventoryService inventoryService;
    public InventoryCaseImpl(IInventoryService inventoryService) { this.inventoryService = inventoryService; }
    @Override
    public Response<InventoryResponseDTO> query(InventoryQueryRequestDTO request) {
        int quantity = inventoryService.availableQuantity(request.productId());
        return new Response<>("SUCCESS", "Inventory queried", new InventoryResponseDTO(request.productId(), quantity));
    }
}
END PACKAGE EXAMPLE */
