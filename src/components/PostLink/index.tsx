import type { TPost } from "@/features/metadata/type";
import { Button } from "@/park-ui/components/button";
import { FileIcon, Link2Icon } from "lucide-react";
import { css } from "styled-system/css";

import NextLink from "next/link";

import path from "path-browserify";
import { Stack } from "styled-system/jsx";

export const BackLinks = ({ tPost }: { tPost: TPost }) => {
	return (
		<>
			<p
				className={css({
					fontSize: "0.8em",
					fontWeight: "bold",
					lineHeight: 0,
					px: 2,
				})}
			>
				関連
			</p>
			<Stack
				className={css({
					gap: 0,
				})}
			>
				{tPost?.backLinks.map((bl) => (
					<Button
						asChild
						key={bl.path}
						variant={"ghost"}
						size={{ md: "md", base: "sm" }}
						fontWeight={"normal"}
						justifyContent={"start"}
						rounded={"sm"}
						height={"auto"}
						p={{ md: 2, base: 1 }}
						textDecoration={"none"}
					>
						<NextLink href={path.join("/", bl.path)}>
							<FileIcon />
							{bl.title}
						</NextLink>
					</Button>
				))}
			</Stack>
		</>
	);
};

export const TwoHopLinks = ({ tPost }: { tPost: TPost }) => {
	return (
		<>
			{tPost?.twoHopLinks.map((thl) => (
				<Stack
					key={thl.path}
					className={css({
						gap: 0,
					})}
				>
					<Button
						asChild
						key={thl.path}
						variant={"ghost"}
						size={{ md: "md", base: "sm" }}
						justifyContent={"start"}
						rounded={"sm"}
						height={"auto"}
						p={{ md: 2, base: 1 }}
						textDecoration={"none"}
					>
						<NextLink href={path.join("/", thl.path)}>
							<FileIcon />
							{thl.title}
						</NextLink>
					</Button>
					{thl.links.map((l) => (
						<Button
							asChild
							key={l.path}
							variant={"ghost"}
							size={{ md: "md", base: "sm" }}
							fontWeight={"normal"}
							justifyContent={"start"}
							rounded={"sm"}
							height={"auto"}
							p={{ md: 2, base: 1 }}
							ml={"2em"}
							textDecoration={"none"}
						>
							<NextLink href={path.join("/", l.path)}>
								<Link2Icon />
								{l.title}
							</NextLink>
						</Button>
					))}
				</Stack>
			))}
		</>
	);
};
