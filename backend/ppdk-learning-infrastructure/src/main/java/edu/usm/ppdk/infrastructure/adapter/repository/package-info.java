/**
 * Implement domain repositories with a DAO or Redis for local data access. Keep remote calls in external adapters.
 * Use OrderRepository for the repository implementation and omit the Impl suffix.
 * Use @Repository from Spring Context. Enable persistence for DAO and MyBatis and implement and wire the converters.
 * Translate persistence objects to domain aggregates. Keep cross-domain coordination and external service calls outside the repository.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.infrastructure.adapter.repository;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.stereotype.Repository;
import java.util.NoSuchElementException;
import edu.usm.ppdk.domain.xxx.adapter.repository.IOrderRepository;
import edu.usm.ppdk.domain.xxx.model.aggregate.OrderAggregate;
import edu.usm.ppdk.infrastructure.dao.IOrderDao;
import edu.usm.ppdk.infrastructure.dao.po.OrderPO;

@Repository
public class OrderRepository implements IOrderRepository {
    private final IOrderDao orderDao;
    private final IOrderPersistenceConverter converter;
    public OrderRepository(IOrderDao orderDao, IOrderPersistenceConverter converter) {
        this.orderDao = orderDao;
        this.converter = converter;
    }
    @Override
    public OrderAggregate findById(String orderId) {
        OrderPO orderPO = orderDao.findById(orderId);
        if (orderPO == null) { throw new NoSuchElementException("Order not found"); }
        return converter.toAggregate(orderPO);
    }
    @Override
    public void save(OrderAggregate orderAggregate) { orderDao.save(converter.toPO(orderAggregate)); }
}
// Implement example converters in separate files and avoid placeholder implementations that return null.
public interface IOrderPersistenceConverter {
    OrderAggregate toAggregate(OrderPO orderPO);
    OrderPO toPO(OrderAggregate orderAggregate);
}
END PACKAGE EXAMPLE */
