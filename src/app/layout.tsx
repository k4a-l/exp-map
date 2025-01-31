import "../../styled-system/styles.css";
import "./index.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { HashIcon, SearchIcon } from "lucide-react";
import Image from "next/image";
import path from "path-browserify";

import { getSearchPath } from "@/app/search/util";
import { BookmarkDrawer } from "@/components/Bookmark";
import Scroll from "@/components/Hook/Scroll";
import { NextLink } from "@/components/Link/NextLink";
import { SummarizeByYM } from "@/components/Summazize";
import { getBookmarkObject } from "@/features/file/io";
import { notesDirPath } from "@/features/metadata/constant";
import { Button } from "@/park-ui/components/button";
import { Link } from "@/park-ui/components/link";
import { css } from "styled-system/css";
import { HStack, Spacer, Stack } from "styled-system/jsx";

import type React from "react";

export const HEADER_HEIGHT = "34px";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const gaId = process.env.GA_ID!;
export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const bookmark = getBookmarkObject();

	return (
		<html lang="ja">
			<Scroll />
			{process.env.NODE_ENV === "production" && <GoogleAnalytics gaId={gaId} />}
			<body>
				<Stack
					className={css({
						bgColor: "neutral.100",
						fontSize: { sm: "1em", base: "0.8em" },
					})}
					h="auto"
					minH="full"
					w="full"
				>
					<HStack
						className={css({
							bg: "white",
							position: "sticky",
							top: 0,
							zIndex: 1,
							h: HEADER_HEIGHT,
							px: 1,
							py: 1,
							boxShadow: "sm",
							w: "full",
						})}
						justifyContent={"space-between"}
					>
						<BookmarkDrawer root={bookmark} />
						<Link asChild>
							<NextLink href={path.join("/", notesDirPath)}>
								<Image
									alt="logo"
									height={30}
									src="/assets/logo.png"
									width={30}
								/>
							</NextLink>
						</Link>

						<Spacer />

						<Button
							asChild
							gap={0}
							h="100%"
							px={2}
							size="xs"
							textDecoration={"none"}
							variant={"ghost"}
						>
							<NextLink href={getSearchPath({})}>
								<HashIcon strokeWidth={2} />
								/
								<SearchIcon strokeWidth={2} />
							</NextLink>
						</Button>
					</HStack>
					<Stack flex={1} h="auto" minH="full" w="full">
						<Stack
							alignItems={"center"}
							flex={1}
							h="auto"
							justifyContent={"start"}
							minH="full"
							p={4}
							w="full"
						>
							{children}
						</Stack>
						<HStack
							className={css({
								bg: "white",
							})}
							gap={1}
							justify={"center"}
							p={8}
							w="full"
						>
							<HStack maxW={"max(1000px,100%)"} w={"min(1000px,100%)"}>
								<SummarizeByYM />
							</HStack>
						</HStack>
					</Stack>
				</Stack>
			</body>
		</html>
	);
}
