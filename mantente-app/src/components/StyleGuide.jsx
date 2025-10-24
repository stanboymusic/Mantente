import React from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Table } from 'react-bootstrap';
import '../styles/BrandingGuide.css';

const StyleGuide = () => {
  return (
    <Container className="py-5">
      <h1 className="mantente-heading mb-5">Guía de Estilo de Mantente</h1>
      
      {/* Sección de Colores */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Paleta de Colores</h2>
        <Row className="g-4">
          <Col md={3}>
            <Card className="h-100 mantente-card">
              <div className="mantente-bg-blue p-4" style={{ height: '100px' }}></div>
              <Card.Body>
                <h5>Azul Principal</h5>
                <p className="text-muted">#0078D7</p>
                <p>Color primario para elementos principales y acciones.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 mantente-card">
              <div className="mantente-bg-orange p-4" style={{ height: '100px' }}></div>
              <Card.Body>
                <h5>Naranja Acento</h5>
                <p className="text-muted">#FF8C00</p>
                <p>Color de acento para destacar elementos importantes.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 mantente-card">
              <div className="mantente-bg-green p-4" style={{ height: '100px' }}></div>
              <Card.Body>
                <h5>Verde Éxito</h5>
                <p className="text-muted">#107C10</p>
                <p>Para mensajes de éxito y confirmación.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 mantente-card">
              <div className="mantente-bg-red p-4" style={{ height: '100px' }}></div>
              <Card.Body>
                <h5>Rojo Error</h5>
                <p className="text-muted">#E81123</p>
                <p>Para mensajes de error y alertas.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
      
      {/* Sección de Tipografía */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Tipografía</h2>
        <Row className="g-4">
          <Col md={6}>
            <Card className="mantente-card">
              <Card.Body>
                <h3 className="mantente-heading">Montserrat</h3>
                <p className="text-muted">Para títulos y encabezados</p>
                <div className="mt-4">
                  <h1 className="mantente-heading">Título H1</h1>
                  <h2 className="mantente-heading">Título H2</h2>
                  <h3 className="mantente-heading">Título H3</h3>
                  <h4 className="mantente-heading">Título H4</h4>
                  <h5 className="mantente-heading">Título H5</h5>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="mantente-card">
              <Card.Body>
                <h3 className="mantente-heading">Open Sans</h3>
                <p className="text-muted">Para texto de cuerpo y contenido</p>
                <div className="mt-4">
                  <p className="mantente-body">Texto normal para párrafos y contenido general de la aplicación.</p>
                  <p className="mantente-body fw-bold">Texto en negrita para enfatizar información importante.</p>
                  <p className="mantente-body fst-italic">Texto en cursiva para citas o referencias.</p>
                  <p className="mantente-body text-muted">Texto secundario con menor énfasis visual.</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
      
      {/* Sección de Botones */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Botones</h2>
        <Card className="mantente-card">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col md={3}>
                <Button className="w-100 mb-2">Botón Primario</Button>
                <Button variant="outline-primary" className="w-100">Botón Outline</Button>
              </Col>
              <Col md={3}>
                <Button className="w-100 mb-2 btn-accent">Botón Acento</Button>
                <Button variant="success" className="w-100">Botón Éxito</Button>
              </Col>
              <Col md={3}>
                <Button variant="danger" className="w-100 mb-2">Botón Peligro</Button>
                <Button variant="warning" className="w-100">Botón Advertencia</Button>
              </Col>
              <Col md={3}>
                <Button variant="secondary" className="w-100 mb-2">Botón Secundario</Button>
                <Button variant="link" className="w-100">Botón Enlace</Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </section>
      
      {/* Sección de Formularios */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Formularios</h2>
        <Card className="mantente-card">
          <Card.Body>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Campo de texto</Form.Label>
                  <Form.Control type="text" placeholder="Ingrese texto" />
                  <Form.Text className="text-muted">
                    Texto de ayuda para el campo.
                  </Form.Text>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Selección</Form.Label>
                  <Form.Select>
                    <option>Seleccione una opción</option>
                    <option value="1">Opción 1</option>
                    <option value="2">Opción 2</option>
                    <option value="3">Opción 3</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Área de texto</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="Ingrese texto multilínea" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Check type="checkbox" label="Casilla de verificación" />
                  <Form.Check type="radio" label="Opción de radio 1" name="radioGroup" />
                  <Form.Check type="radio" label="Opción de radio 2" name="radioGroup" />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </section>
      
      {/* Sección de Tarjetas */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Tarjetas</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="mantente-card h-100">
              <Card.Header>Encabezado de Tarjeta</Card.Header>
              <Card.Body>
                <Card.Title>Título de Tarjeta</Card.Title>
                <Card.Text>
                  Contenido de la tarjeta con información relevante para el usuario.
                </Card.Text>
                <Button variant="primary">Acción</Button>
              </Card.Body>
              <Card.Footer className="text-muted">Pie de tarjeta</Card.Footer>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mantente-card h-100 text-center">
              <Card.Body>
                <div className="mb-3">
                  <img 
                    src="/material visual/logo.png" 
                    alt="Mantente Logo" 
                    style={{ width: '80px', height: '80px' }} 
                    className="mb-3"
                  />
                </div>
                <Card.Title>Tarjeta con Imagen</Card.Title>
                <Card.Text>
                  Tarjeta con imagen centrada y estilo minimalista.
                </Card.Text>
                <Button variant="outline-primary">Acción Secundaria</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mantente-card h-100 mantente-bg-gold" style={{ color: 'var(--mantente-dark-gray)' }}>
              <Card.Body>
                <Card.Title>Tarjeta Destacada</Card.Title>
                <Card.Text>
                  Tarjeta con color de fondo para destacar información importante.
                </Card.Text>
                <Button variant="light" style={{ color: 'var(--mantente-brown)' }}>Acción Contrastante</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>
      
      {/* Sección de Tablas */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Tablas</h2>
        <Card className="mantente-card">
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Producto A</td>
                  <td>$100.00</td>
                  <td>2</td>
                  <td>$200.00</td>
                  <td><Badge bg="success">Completado</Badge></td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Producto B</td>
                  <td>$75.50</td>
                  <td>1</td>
                  <td>$75.50</td>
                  <td><Badge bg="warning">Pendiente</Badge></td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Producto C</td>
                  <td>$50.00</td>
                  <td>3</td>
                  <td>$150.00</td>
                  <td><Badge bg="danger">Cancelado</Badge></td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </section>
      
      {/* Sección de Badges */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Badges y Etiquetas</h2>
        <Card className="mantente-card">
          <Card.Body>
            <div className="d-flex flex-wrap gap-2 mb-4">
              <Badge bg="primary">Primario</Badge>
              <Badge className="bg-accent">Acento</Badge>
              <Badge bg="success">Éxito</Badge>
              <Badge bg="danger">Error</Badge>
              <Badge bg="warning">Advertencia</Badge>
              <Badge bg="info">Información</Badge>
              <Badge bg="secondary">Secundario</Badge>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Badge pill bg="primary">Primario</Badge>
              <Badge pill className="bg-accent">Acento</Badge>
              <Badge pill bg="success">Éxito</Badge>
              <Badge pill bg="danger">Error</Badge>
              <Badge pill bg="warning">Advertencia</Badge>
              <Badge pill bg="info">Información</Badge>
              <Badge pill bg="secondary">Secundario</Badge>
            </div>
          </Card.Body>
        </Card>
      </section>
      
      {/* Sección de Logos */}
      <section className="mb-5">
        <h2 className="mantente-heading mb-4">Logos e Iconografía</h2>
        <Card className="mantente-card">
          <Card.Body>
            <Row className="g-4 text-center">
              <Col md={4}>
                <img 
                  src="/material visual/logo.png" 
                  alt="Mantente Logo" 
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '150px' }} 
                  className="mb-3"
                />
                <h5>Logo Principal</h5>
              </Col>
              <Col md={4}>
                <img 
                  src="/material visual/logo con nombre.png" 
                  alt="Mantente Logo con Nombre" 
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '150px' }} 
                  className="mb-3"
                />
                <h5>Logo con Nombre</h5>
              </Col>
              <Col md={4}>
                <div className="d-flex flex-column align-items-center">
                  <img 
                    src="/material visual/logo.png" 
                    alt="Mantente Logo" 
                    style={{ maxWidth: '100%', height: 'auto', maxHeight: '100px' }} 
                    className="mb-2"
                  />
                  <p style={{ color: 'var(--mantente-gold)', fontStyle: 'italic', fontSize: '1rem', fontWeight: '500' }}>
                    "Decisiones claras, negocios rentables"
                  </p>
                </div>
                <h5>Logo con Slogan</h5>
              </Col>
            </Row>
            <hr className="my-4" />
            <h4 className="mantente-heading mb-3">Iconos de Navegación</h4>
            <div className="text-center">
              <img 
                src="/material visual/iconos barra de navegacion.png" 
                alt="Iconos de Navegación" 
                style={{ maxWidth: '100%', height: 'auto' }} 
                className="mb-3"
              />
            </div>
          </Card.Body>
        </Card>
      </section>
    </Container>
  );
};

export default StyleGuide;