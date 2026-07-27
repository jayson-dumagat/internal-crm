import type {
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
}

interface TableHeaderProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableBodyProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

type TableCellProps =
  | ({
      isHeader: true;
      children?: ReactNode;
    } & ThHTMLAttributes<HTMLTableCellElement>)
  | ({
      isHeader?: false;
      children?: ReactNode;
    } & TdHTMLAttributes<HTMLTableCellElement>);

const Table: React.FC<TableProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <table
      className={`min-w-full ${className}`}
      {...props}
    >
      {children}
    </table>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
};

const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className = "",
  ...props
}) => {
  if (isHeader) {
    return (
      <th
        className={className}
        {...(props as ThHTMLAttributes<HTMLTableCellElement>)}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      className={className}
      {...(props as TdHTMLAttributes<HTMLTableCellElement>)}
    >
      {children}
    </td>
  );
};

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
};