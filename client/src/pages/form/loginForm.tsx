import React, { useEffect } from "react";
import { Form, Link as ReactLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SignInGoogle from "../../api/googleSignin";
import { useAuth } from "../../hooks/authContext";
import backgroundImage from "../.././assets/image_group/blue-pink-better-theme.png";

import "@fontsource/inter";

import {
  FormControl,
  FormLabel,
  Input,
  Link,
  Box,
  Flex,
  InputGroup,
  InputRightElement,
  Button,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";

export default function LoginForm() {
  const navigate = useNavigate();
  // eslint-disable-next-line no-restricted-globals
  const urlParams = new URLSearchParams(location.search);
  const redirect = urlParams.get("redirect");
  const [usernameOrEmail, setusernameOrEmail] = useState<string>("");
  const [loginPass, setLoginPassword] = useState<string>("");
  const { authed, setAuthed } = useAuth();
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();

  useEffect(() => {
    if (authed) {
      navigate("/profile");
    }
  });
  //Remvoe when protected routes

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = JSON.stringify({
      username: usernameOrEmail,
      password: loginPass,
    });

    const response: Response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    const receivedData = await response.json();

    if (response.ok) {
      toast({
        title: "Login Succesful.",
        description: `${receivedData.message}`,
        status: "success",
        duration: 4000,
      });
      setAuthed(true);
      if (
        redirect &&
        !redirect.startsWith("http://") &&
        !redirect.startsWith("https://")
      ) {
        window.location.replace(redirect);
        return;
      }
      navigate("/profile");
    } else {
      toast({
        title: "Login failed.",
        description: `${receivedData.message}.`,
        status: "error",
        duration: 4000,
      });
    }
  }

  return (
    <Flex
      borderColor={"red"}
      height="100vh"
      backgroundPosition="40%"
      position="absolute"
      width="100vw"
      objectFit="cover"
      justifyContent={"center"}
      alignItems="center"
      backgroundImage={backgroundImage}
    >
      <Box
        bgColor="white"
        borderRadius="25px"
        p="60px 40px"
        boxShadow="0px 0px 5px rgba(0, 0, 0, 0.265)"
      >
        <Heading fontWeight="900" marginBottom="50px">
          Login
        </Heading>
        <Form onSubmit={handleSubmit}>
          <Flex gap="30px" flexDir="column">
            <FormControl variant="floating" id="usernameEmail" isRequired>
              <Input
                placeholder=" "
                onChange={(e) => setusernameOrEmail(e.target.value)}
              />
              <FormLabel>Username or Email</FormLabel>
            </FormControl>
            <FormControl variant="floating" id="password" isRequired>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  type={show ? "text" : "password"}
                  placeholder=" "
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
                <FormLabel>Password</FormLabel>
                <InputRightElement width="4.5rem">
                  <Button
                    marginTop="auto"
                    marginBottom="auto"
                    variant="outline"
                    colorScheme="blue"
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                  >
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Flex flexDir="row" gap="8px">
              <Button flexGrow="1" type="submit" colorScheme="pink">
                Sign in
              </Button>
              {/* <Button colorScheme="red" padding="0"> */}
              <GoogleOAuthProvider
                clientId={`${process.env.REACT_APP_CLIENTID}`}
              >
                <SignInGoogle />
              </GoogleOAuthProvider>
              {/* </Button> */}
            </Flex>

            <Flex alignItems="center" gap="5px" flexDirection="column">
              <Text>
                Dont have an account?{" "}
                <Link as={ReactLink} to="/register" color="teal.500">
                  Sign up
                </Link>
              </Text>

              {/* <Text >
              <Link color="teal.500">Forgot Password?</Link>{" "}
            </Text>
            <Text >
              <Link color="teal.500">Need help?</Link>{" "}
            </Text> */}
            </Flex>
          </Flex>
        </Form>
      </Box>
    </Flex>
  );
}