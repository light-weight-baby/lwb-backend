import {
  Avatar,
  Card,
  CardHeader,
  Flex,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import {
  AiOutlineDelete,
  AiOutlineUserAdd,
  AiOutlineMore,
} from "react-icons/ai";

export default function IndividualFriend({ item, handleButtonClick }: any) {
  return (
    <Card style={{ marginBottom: "5px" }} key={item.username} maxW="md">
      <CardHeader>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center" flexWrap="wrap">
            <Avatar name={item.profilePic} src={item.profilePic} />
            <Heading size="sm">{item.username}</Heading>
          </Flex>
          <Menu>
            <MenuButton
              as={IconButton}
              fontSize={"20px"}
              aria-label="Options"
              icon={<Icon as={AiOutlineMore} />}
              variant="ghost"
              colorScheme="gray"
            />
            <MenuList>
              <MenuItem icon={<Icon boxSize={5} as={AiOutlineUserAdd} />}>
                Invite to event
              </MenuItem>
              <MenuItem
                onClick={(event) => handleButtonClick(item.username)}
                icon={<Icon boxSize={5} as={AiOutlineDelete} />}
              >
                Remove Friend
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>
    </Card>
  );
}
