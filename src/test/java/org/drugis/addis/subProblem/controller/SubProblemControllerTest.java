package org.drugis.addis.subProblem.controller;

import org.drugis.addis.TestUtils;
import org.drugis.addis.config.TestConfig;
import org.drugis.addis.subProblem.SubProblem;
import org.drugis.addis.subProblem.controller.command.SubProblemCommand;
import org.drugis.addis.subProblem.repository.SubProblemRepository;
import org.drugis.addis.util.WebConstants;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import javax.inject.Inject;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Created by joris on 8-5-17.
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestConfig.class})
@WebAppConfiguration
public class SubProblemControllerTest {
  private MockMvc mockMvc;

  @Mock
  SubProblemRepository subProblemRepository;

  @Inject
  private WebApplicationContext webApplicationContext;

  @InjectMocks
  private SubProblemController subProblemController = new SubProblemController();

  @Before
  public void setUp() {
    initMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(subProblemController).build();
  }

  @After
  public void tearDown() {
    verifyNoMoreInteractions(subProblemRepository);
  }

  @Test
  public void testGet() throws Exception {
    when(subProblemRepository.get(3)).thenReturn(new SubProblem(2, "{}", "Default"));
    mockMvc.perform(get("/projects/1/analyses/2/problems/3"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(WebConstants.getApplicationJsonUtf8Value()))
            .andExpect(jsonPath("$.title", is("Default")));
    verify(subProblemRepository).get(3);
  }

  @Test
  public void testCreateWithoutCredentialsFails() throws Exception {
    SubProblemCommand subProblemCommand = new SubProblemCommand("{}", "Degauss");
    String body = TestUtils.createJson(subProblemCommand);
    mockMvc.perform(post("/projects/1/analyses/2/problems")
              .content(body)
              .contentType(WebConstants.getApplicationJsonUtf8Value()))
            .andExpect(status().isMethodNotAllowed());
  }

  @Test
  public void testCreate() throws Exception {
    SubProblemCommand subProblemCommand = new SubProblemCommand("{}", "Degauss");
    String body = TestUtils.createJson(subProblemCommand);

    when(subProblemRepository.create(2, "{}", "Degauss")).thenReturn(new SubProblem(2, "{}", "Degauss"));

    mockMvc.perform(post("/projects/1/analyses/2/problems")
            .content(body)
            .contentType(WebConstants.getApplicationJsonUtf8Value()))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.title", is("Degauss")));
    verify(subProblemRepository).create(2, "{}", "Degauss");
  }



}