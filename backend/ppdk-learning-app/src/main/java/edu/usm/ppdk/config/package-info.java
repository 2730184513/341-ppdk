/**
 * Application assembly and initialization for resources provided by dependent modules.
 * Use DomainConfiguration for the domain assembly configuration.
 * Declare @Configuration and @Bean in App. Wire plain Java domain implementations to infrastructure beans through their interfaces.
 * Assemble domain implementations that lack Spring annotations. Case classes may use @Service. Avoid registering the same bean twice.
 * Examples are illustrative. Implement the collaborators and put each public type in its own file.
 */
package edu.usm.ppdk.config;

/* BEGIN PACKAGE EXAMPLE
// This commented example is excluded from compilation and provides no runtime behavior or integration.
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import edu.usm.ppdk.domain.xxx.service.IOrderService;
import edu.usm.ppdk.domain.xxx.service.impl.OrderServiceImpl;
import edu.usm.ppdk.domain.xxx.adapter.repository.IOrderRepository;

@Configuration(proxyBeanMethods = false)
public class DomainConfiguration {
    @Bean
    public IOrderService orderService(IOrderRepository orderRepository) {
        return new OrderServiceImpl(orderRepository);
    }
}
END PACKAGE EXAMPLE */
